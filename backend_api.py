#!/usr/bin/env python3

import os
import sys
import asyncio
import subprocess
from pathlib import Path
from fastapi import FastAPI, HTTPException, Form, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, ORJSONResponse, Response
from typing import Optional
import uuid
import base64
from pydantic import BaseModel
import time
import json

# RunPod 환경 설정 - 워크스페이스가 /workspace에 있음
WORKSPACE_DIR = Path("/workspace")
FACEFUSION_DIR = WORKSPACE_DIR / "facefusion"
TEMP_DIR = WORKSPACE_DIR / "temp_api"
VIDEOS_DIR = WORKSPACE_DIR / "videos"

# 디렉토리 생성
TEMP_DIR.mkdir(exist_ok=True)
VIDEOS_DIR.mkdir(exist_ok=True)

# 작업 상태 추적 - 메모리 기반으로 더 빠르게
job_status = {}
job_file_paths = {}  # job_id -> actual file path 매핑

app = FastAPI(
    title="FaceFusion Backend API",
    description="RunPod Hub Deployment - Optimized",
    version="1.0.0",
    default_response_class=ORJSONResponse  # 기본적으로 더 빠른 JSON 사용
)

# 정적 파일 서빙 (가장 빠른 방법!)
app.mount("/files", StaticFiles(directory=str(TEMP_DIR)), name="files")

# CORS 설정 - 스트리밍 최적화
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # RunPod 프록시를 위해 모든 origin 허용
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*", "Range", "Content-Range", "Accept-Ranges"],
    expose_headers=["*", "Content-Range", "Accept-Ranges", "Content-Length"],
)

class ProcessResponse(BaseModel):
    success: bool
    output_path: Optional[str] = None
    error: Optional[str] = None
    job_id: str

# 파일 경로 미리 캐싱 - 매번 찾지 않도록 최적화
def get_cached_output_path(job_id: str) -> Optional[Path]:
    """캐시된 출력 파일 경로 반환"""
    if job_id in job_file_paths:
        cached_path = Path(job_file_paths[job_id])
        if cached_path.exists():
            return cached_path
    
    # 캐시에 없으면 빠르게 찾기
    possible_paths = [
        TEMP_DIR / f"output_{job_id}.mp4",
        WORKSPACE_DIR / "temp_api" / f"output_{job_id}.mp4",
    ]
    
    for path in possible_paths:
        if path.exists():
            job_file_paths[job_id] = str(path)  # 캐시에 저장
            return path
    
    return None

async def process_facefusion(job_id: str, source_path: Path, target_path: Path, output_path: Path):
    """백그라운드에서 FaceFusion 처리 - 최적화됨"""
    try:
        print(f"[{job_id}] ⚡ Starting optimized FaceFusion processing...")
        job_status[job_id] = {"status": "processing", "progress": 0, "start_time": time.time()}
        
        # H200에 최적화된 설정
        thread_count = os.environ.get('RUNPOD_CPU_COUNT', '16')  # H200에 맞게 더 많은 스레드
        if int(thread_count) > 64:
            thread_count = '64'  # H200은 더 많은 스레드 처리 가능
        
        # 출력 디렉토리 생성
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # H200 최적화된 FaceFusion 실행 명령 - 속도 우선 설정
        bash_cmd = f"""
        eval "$(micromamba shell hook --shell bash)"
        micromamba activate facefusion
        cd /workspace/facefusion
        python facefusion.py headless-run \
            --source-paths {source_path} \
            --target-path {target_path} \
            --output-path {output_path} \
            --processors face_swapper face_enhancer \
            --face-detector-model yolo_face \
            --face-swapper-model inswapper_128_fp16 \
            --face-swapper-pixel-boost 384x384 \
            --output-video-resolution 1280x720 \
            --execution-providers cuda \
            --execution-thread-count {thread_count} \
            --execution-queue-count 2 \
            --output-audio-encoder aac \
            --face-selector-mode one \
            --face-selector-order right-left \
            --log-level error
        """
        
        print(f"[{job_id}] ⚡ Running FaceFusion with {thread_count} threads on H200")
        
        # 환경 변수 최적화
        env = os.environ.copy()
        env['HF_HOME'] = '/workspace'
        env['PYTHONIOENCODING'] = 'utf-8'
        env['CUDA_VISIBLE_DEVICES'] = '0'  # H200 GPU 명시적 사용
        env['OMP_NUM_THREADS'] = thread_count
        
        # 프로세스 실행
        process = await asyncio.create_subprocess_exec(
            'bash', '-c', bash_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env
        )
        
        stdout, stderr = await process.communicate()
        processing_time = time.time() - job_status[job_id]["start_time"]
        
        print(f"[{job_id}] ⚡ Return code: {process.returncode} (took {processing_time:.1f}s)")
        
        # 출력 파일 즉시 확인 및 캐싱
        actual_output_path = get_cached_output_path(job_id)
        if not actual_output_path:
            # 처리 직후 파일 찾기
            possible_paths = [
                output_path,
                WORKSPACE_DIR / "temp_api" / f"output_{job_id}.mp4",
                TEMP_DIR / f"output_{job_id}.mp4"
            ]
            
            for path in possible_paths:
                if path.exists():
                    actual_output_path = path
                    job_file_paths[job_id] = str(path)  # 즉시 캐싱
                    break
        
        if process.returncode == 0 and actual_output_path:
            file_size = actual_output_path.stat().st_size
            print(f"[{job_id}] ✅ SUCCESS! File: {actual_output_path} ({file_size/1024/1024:.1f}MB)")
            
            # 예상 경로와 다르면 복사
            if actual_output_path != output_path:
                import shutil
                shutil.copy(actual_output_path, output_path)
                job_file_paths[job_id] = str(output_path)  # 캐시 업데이트
                
            job_status[job_id] = {
                "status": "completed", 
                "progress": 100, 
                "output_path": str(output_path),
                "processing_time": processing_time,
                "file_size": file_size
            }
        else:
            error_msg = stderr.decode('utf-8', errors='ignore') if stderr else "Processing failed"
            print(f"[{job_id}] ❌ FAILED: {error_msg}")
            job_status[job_id] = {"status": "failed", "progress": 0, "error": error_msg}
            
    except Exception as e:
        print(f"[{job_id}] 💥 EXCEPTION: {str(e)}")
        job_status[job_id] = {"status": "failed", "progress": 0, "error": str(e)}

@app.get("/")
async def root():
    return {
        "message": "FaceFusion Backend API - RunPod Hub",
        "version": "1.0.0",
        "status": "ready",
        "workspace": str(WORKSPACE_DIR),
        "facefusion_dir": str(FACEFUSION_DIR),
        "gpu_available": any(os.path.exists(f"/dev/nvidia{i}") for i in range(8)),
        "proxy_url": f"https://{os.environ.get('RUNPOD_POD_ID', 'localhost')}-8001.proxy.runpod.net" if os.environ.get('RUNPOD_POD_ID') else "http://localhost:8001"
    }

@app.get("/health")
async def health_check():
    """헬스체크 엔드포인트"""
    try:
        # FaceFusion 설치 확인
        facefusion_exists = FACEFUSION_DIR.exists() and (FACEFUSION_DIR / "facefusion.py").exists()
    except Exception:
        facefusion_exists = False
    
    return {
        "status": "healthy" if facefusion_exists else "unhealthy",
        "facefusion_available": facefusion_exists,
        "facefusion_path": str(FACEFUSION_DIR),
        "gpu_available": any(os.path.exists(f"/dev/nvidia{i}") for i in range(8)),
        "workspace": str(WORKSPACE_DIR),
        "temp_dir": str(TEMP_DIR),
        "videos_dir": str(VIDEOS_DIR)
    }

@app.get("/videos")
async def get_video_list():
    try:
        video_files = []
        # 파일명 순서대로 정렬하여 일관된 순서 보장
        sorted_files = sorted(VIDEOS_DIR.glob("*.mp4"), key=lambda x: x.name)
        for i, file_path in enumerate(sorted_files):
            video_files.append({
                "id": i + 1,
                "filename": file_path.name,
                "path": str(file_path)
            })
        print(f"Available videos: {[f['filename'] for f in video_files]}")
        return {"videos": video_files}
    except Exception as e:
        print(f"Error getting video list: {str(e)}")
        return {"error": str(e), "videos": []}

@app.post("/faceswap-with-camera")
async def faceswap_with_camera(
    background_tasks: BackgroundTasks,
    face_image_base64: str = Form(...),
    video_id: int = Form(...)  # 숫자로 다시 변경
):
    job_id = str(uuid.uuid4())
    
    try:
        print(f"[{job_id}] Starting face swap with camera")
        
        # base64 이미지 저장 - 오류 처리 개선
        try:
            # base64 데이터 정리
            if ',' in face_image_base64:
                # data:image/jpeg;base64,... 형태에서 실제 데이터 부분만 추출
                base64_data = face_image_base64.split(',')[1]
            else:
                base64_data = face_image_base64
            
            # 공백 및 개행 문자 제거
            base64_data = base64_data.strip().replace('\n', '').replace('\r', '')
            
            print(f"[{job_id}] Base64 data length: {len(base64_data)}")
            
            # base64 디코딩
            image_data = base64.b64decode(base64_data)
            
            source_path = TEMP_DIR / f"camera_face_{job_id}.jpg"
            
            with open(source_path, "wb") as f:
                f.write(image_data)
                
            print(f"[{job_id}] Saved source image: {source_path} ({len(image_data)} bytes)")
                
        except Exception as img_error:
            print(f"[{job_id}] Image processing error: {str(img_error)}")
            raise HTTPException(status_code=400, detail=f"Invalid image data: {str(img_error)}")
        
        # 비디오 파일 찾기 (숫자 기반)
        try:
            video_files = sorted(VIDEOS_DIR.glob("*.mp4"), key=lambda x: x.name)
            if not video_files:
                raise HTTPException(status_code=400, detail="No video files found")
            
            if video_id < 1 or video_id > len(video_files):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid video_id: {video_id}. Available: 1-{len(video_files)}"
                )
            
            target_path = video_files[video_id - 1]  # 1-based index
            video_filename = target_path.name
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error finding video: {str(e)}")
        
        print(f"[{job_id}] Looking for video: {video_filename}")
        print(f"[{job_id}] Target path: {target_path}")
        
        output_path = TEMP_DIR / f"output_{job_id}.mp4"
        
        print(f"[{job_id}] Selected video: {video_filename}")
        print(f"[{job_id}] Using video: {target_path}")
        
        print(f"[{job_id}] Video file size: {target_path.stat().st_size} bytes")
        
        # 작업 상태 초기화
        job_status[job_id] = {"status": "started", "progress": 0}
        
        # 백그라운드에서 FaceFusion 실행
        background_tasks.add_task(process_facefusion, job_id, source_path, target_path, output_path)
        
        print(f"[{job_id}] Job started in background, returning job_id immediately")
        return ProcessResponse(success=True, job_id=job_id)
            
    except Exception as e:
        print(f"[{job_id}] EXCEPTION: {str(e)}")
        return ProcessResponse(success=False, error=str(e), job_id=job_id)

@app.get("/status/{job_id}")
async def get_job_status(job_id: str):
    """작업 상태 확인 - 최적화됨"""
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    status = job_status[job_id].copy()
    
    # 완료된 작업이면 파일 정보도 함께 반환
    if status["status"] == "completed":
        file_path = get_cached_output_path(job_id)
        if file_path:
            status["file_ready"] = True
            status["file_size"] = file_path.stat().st_size
        else:
            status["file_ready"] = False
    
    return status

@app.get("/result/{job_id}/url")
async def get_result_url(job_id: str):
    """결과 파일 URL 반환 - 초고속 최적화!"""
    # 작업 상태 확인
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    status = job_status[job_id]
    if status["status"] != "completed":
        return {"success": False, "status": status["status"], "error": "Job not completed yet"}
    
    # 캐시된 파일 경로 사용
    file_path = get_cached_output_path(job_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="Result file not found")
    
    # 상대 경로 계산
    relative_path = file_path.relative_to(TEMP_DIR)
    
    # RunPod 프록시 URL 생성
    pod_id = os.environ.get('RUNPOD_POD_ID')
    if pod_id:
        file_url = f"https://{pod_id}-8001.proxy.runpod.net/files/{relative_path}"
    else:
        file_url = f"http://localhost:8001/files/{relative_path}"
    
    file_size = file_path.stat().st_size
    print(f"[{job_id}] ⚡ Ultra-fast URL: {file_url} ({file_size/1024/1024:.1f}MB)")
    
    return {
        "success": True, 
        "file_url": file_url,
        "format": "mp4",
        "job_id": job_id,
        "file_size": file_size,
        "processing_time": status.get("processing_time", 0)
    }

@app.get("/result/{job_id}/stream")
async def stream_result(job_id: str):
    """결과 파일 스트리밍 - 가장 빠른 방법!"""
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    status = job_status[job_id]
    if status["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    file_path = get_cached_output_path(job_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="Result file not found")
    
    file_size = file_path.stat().st_size
    
    def iterfile():
        with open(file_path, mode="rb") as file_like:
            yield from file_like
    
    return StreamingResponse(
        iterfile(), 
        media_type="video/mp4",
        headers={
            "Content-Disposition": f"attachment; filename=result_{job_id}.mp4",
            "Content-Length": str(file_size),
            "Accept-Ranges": "bytes",  # 부분 요청 지원
            "Cache-Control": "public, max-age=3600",  # 1시간 캐시
            "Content-Type": "video/mp4"
        }
    )

@app.get("/result/{job_id}/base64")
async def get_result_base64(job_id: str):
    # 작업 상태 확인
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    status = job_status[job_id]
    if status["status"] != "completed":
        return {"success": False, "status": status["status"], "error": "Job not completed yet"}
    
    # 여러 경로에서 결과 파일 찾기
    possible_locations = [
        TEMP_DIR,  # /workspace/facefusion/temp/
        WORKSPACE_DIR / "temp_api",  # /workspace/temp_api/
        Path("/workspace/temp_api")  # 절대 경로
    ]
    
    for location in possible_locations:
        for ext in ['mp4', 'jpg', 'png']:
            output_path = location / f"output_{job_id}.{ext}"
            if output_path.exists():
                print(f"[{job_id}] Found result file at: {output_path}")
                with open(output_path, "rb") as f:
                    file_data = f.read()
                    base64_data = base64.b64encode(file_data).decode()
                    return {"success": True, "data": base64_data, "format": ext, "job_id": job_id}
    
    print(f"[{job_id}] Result file not found in any location")
    print(f"[{job_id}] Searched locations: {[str(loc) for loc in possible_locations]}")
    raise HTTPException(status_code=404, detail="Result file not found")

@app.get("/download/{job_id}")
async def download_result(job_id: str):
    """결과 파일 다운로드 (blob 형태)"""
    from fastapi.responses import FileResponse
    
    # 작업 상태 확인
    if job_id not in job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    status = job_status[job_id]
    if status["status"] != "completed":
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    # 여러 경로에서 결과 파일 찾기
    possible_locations = [
        TEMP_DIR,  # /workspace/facefusion/temp/
        WORKSPACE_DIR / "temp_api",  # /workspace/temp_api/
        Path("/workspace/temp_api")  # 절대 경로
    ]
    
    for location in possible_locations:
        for ext in ['mp4', 'jpg', 'png']:
            output_path = location / f"output_{job_id}.{ext}"
            if output_path.exists():
                return FileResponse(
                    path=str(output_path),
                    media_type=f"video/{ext}" if ext == 'mp4' else f"image/{ext}",
                    filename=f"result_{job_id}.{ext}"
                )
    
    raise HTTPException(status_code=404, detail="Result file not found")

@app.delete("/cleanup/{job_id}")
async def cleanup_files(job_id: str):
    cleaned_files = []
    for pattern in [f"source_{job_id}.*", f"target_{job_id}.*", f"output_{job_id}.*", f"camera_face_{job_id}.*"]:
        for file_path in TEMP_DIR.glob(pattern):
            try:
                file_path.unlink()
                cleaned_files.append(str(file_path))
            except:
                pass
    
    # 작업 상태도 정리
    if job_id in job_status:
        del job_status[job_id]
    
    return {"success": True, "cleaned_files": cleaned_files}

# OPTIONS 요청을 위한 명시적 핸들러 추가
@app.options("/faceswap-with-camera")
async def faceswap_options():
    return {"message": "OK"}

@app.options("/videos")
async def videos_options():
    return {"message": "OK"}

@app.options("/status/{job_id}")
async def status_options(job_id: str):
    return {"message": "OK"}

@app.options("/result/{job_id}/base64")
async def result_options(job_id: str):
    return {"message": "OK"}

@app.options("/download/{job_id}")
async def download_options(job_id: str):
    return {"message": "OK"}

@app.options("/cleanup/{job_id}")
async def cleanup_options(job_id: str):
    return {"message": "OK"}

@app.get("/debug")
async def debug_info():
    """디버깅 정보 제공"""
    return {
        "status": "Backend is running!",
        "timestamp": time.time(),
        "server_time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "workspace": str(WORKSPACE_DIR),
        "facefusion_dir": str(FACEFUSION_DIR),
        "cors_enabled": True,
        "gpu_available": any(os.path.exists(f"/dev/nvidia{i}") for i in range(8)),
        "environment": {
            "HF_HOME": os.environ.get("HF_HOME", "Not set"),
            "RUNPOD_CPU_COUNT": os.environ.get("RUNPOD_CPU_COUNT", "Not set"),
        }
    }

@app.options("/debug")
async def debug_options():
    return {"message": "OK"}

# 🚀 비디오 최적화 서빙 - 안정적 스트리밍 (버퍼링 방지)
@app.get("/video/{job_id}")
@app.head("/video/{job_id}")
async def serve_video_optimized(job_id: str, request: Request):
    """안정적 비디오 스트리밍 - 중간 로딩 방지"""
    from fastapi import Request
    from fastapi.responses import Response
    import re
    
    if job_id not in job_status or job_status[job_id]["status"] != "completed":
        raise HTTPException(status_code=404, detail="Video not ready")
    
    file_path = get_cached_output_path(job_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="Video file not found")
    
    file_size = file_path.stat().st_size
    
    # HEAD 요청 처리 (병렬 다운로더 지원)
    if request.method == "HEAD":
        return Response(
            status_code=200,
            headers={
                'Content-Length': str(file_size),
                'Accept-Ranges': 'bytes',
                'Content-Type': 'video/mp4',
                'Cache-Control': 'public, max-age=86400',
                'X-Content-Type-Options': 'nosniff'
            }
        )
    
    range_header = request.headers.get('range')
    
    # Range 요청 처리 - 더 큰 청크로 안정화
    if range_header:
        range_match = re.search(r'bytes=(\d+)-(\d*)', range_header)
        if range_match:
            start = int(range_match.group(1))
            end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
            end = min(end, file_size - 1)
            
            content_length = end - start + 1
            
            def buffered_range_generator():
                with open(file_path, 'rb') as f:
                    f.seek(start)
                    remaining = content_length
                    while remaining > 0:
                        # 초고속 전송을 위한 대용량 청크 (1MB)
                        chunk_size = min(1048576, remaining)  
                        chunk = f.read(chunk_size)
                        if not chunk:
                            break
                        remaining -= len(chunk)
                        yield chunk
            
            return StreamingResponse(
                buffered_range_generator(),
                status_code=206,  # Partial Content
                            headers={
                'Content-Range': f'bytes {start}-{end}/{file_size}',
                'Accept-Ranges': 'bytes',
                'Content-Length': str(content_length),
                'Content-Type': 'video/mp4',
                'Cache-Control': 'public, max-age=86400',  # 24시간 캐시
                'Connection': 'keep-alive',  # 연결 유지
                'X-Accel-Buffering': 'no',  # nginx 버퍼링 방지
                'X-Content-Type-Options': 'nosniff',
                'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length'
            }
            )
    
    # 전체 파일 스트리밍 - 안정적 버퍼링
    def stable_file_generator():
        with open(file_path, 'rb') as f:
            while True:
                chunk = f.read(1048576)  # 1MB 청크로 초고속화
                if not chunk:
                    break
                yield chunk
    
    return StreamingResponse(
        stable_file_generator(),
        media_type="video/mp4",
        headers={
            'Content-Length': str(file_size),
            'Accept-Ranges': 'bytes',
            'Content-Type': 'video/mp4',
            'Cache-Control': 'public, max-age=86400',  # 24시간 캐시
            'Connection': 'keep-alive',  # 연결 유지
            'X-Accel-Buffering': 'no',  # nginx 버퍼링 방지
            'X-Content-Type-Options': 'nosniff',
            'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length'
        }
    )

if __name__ == "__main__":
    import uvicorn
    
    # RunPod 환경에서 실행
    port = 8001  # 고정 포트
    print(f"Starting FaceFusion Backend API on port {port}")
    pod_id = os.environ.get('RUNPOD_POD_ID')
    if pod_id:
        proxy_url = f"https://{pod_id}-8001.proxy.runpod.net"
        print(f"RunPod Proxy URL: {proxy_url}/")
        print(f"Health check: {proxy_url}/health")
    else:
        print(f"Local development: http://localhost:{port}/")
        print(f"Health check: http://localhost:{port}/health")
    
    uvicorn.run(
        app, 
        host="0.0.0.0",  # 모든 인터페이스에서 접근 가능
        port=port,
        log_level="info",
        access_log=True
    )
