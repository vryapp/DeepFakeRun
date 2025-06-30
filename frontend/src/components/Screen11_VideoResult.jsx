import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useDeepfake } from "../context/DeepfakeContext";
import { getResultBase64, downloadResult, cleanupFiles } from "../services/api";
import {
  Container,
  ContentBox,
  Title,
  Description,
  Button,
  ButtonContainer,
  WarningBox,
  WarningTitle,
  WarningText
} from "../styles/CommonStyles";

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto 2rem;
  border-radius: 15px;
  overflow: hidden;
  background: #000;
`;

const Video = styled.video`
  width: 100%;
  height: auto;
  display: block;
`;

const AnalysisList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
  text-align: left;
`;

const AnalysisItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(227, 24, 55, 0.05);
  border-radius: 15px;
`;

const ItemIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const ItemContent = styled.div`
  flex: 1;
`;

const ItemTitle = styled.h3`
  color: #333;
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
  font-weight: 600;
`;

const ItemText = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
`;

const TimelineContainer = styled.div`
  margin: 2rem 0;
`;

const TimelineBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f1f1f1;
  border-radius: 4px;
  margin-bottom: 1rem;
  position: relative;
`;

const TimelineMarker = styled.div`
  position: absolute;
  top: -8px;
  width: 24px;
  height: 24px;
  background: #E31837;
  border-radius: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(-50%) scale(1.2);
  }

  &::after {
    content: "${props => props.time}";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 0.5rem;
    white-space: nowrap;
    font-size: 0.9rem;
    color: #666;
  }
`;

const TimelineLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
`;

const DownloadButton = styled(Button)`
  background: #28a745;
  
  &:hover {
    background: #218838;
  }
`;

export default function Screen11_VideoResult() {
  const navigate = useNavigate();
  const { jobId, setJobId, resultData } = useDeepfake();
  const [resultVideoUrl, setResultVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) {
              navigate("/situation/select");
      return;
    }

    const loadResult = async () => {
      try {
        setIsLoading(true);
        
        // Context에서 결과 데이터가 있으면 사용
        if (resultData && resultData.success) {
          console.log("Using result data from context:", resultData);
          
          // base64를 blob URL로 변환
          const byteCharacters = atob(resultData.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const mimeType = resultData.format === 'mp4' ? 'video/mp4' : 'image/jpeg';
          const blob = new Blob([byteArray], { type: mimeType });
          const videoUrl = URL.createObjectURL(blob);
          setResultVideoUrl(videoUrl);
        } else {
          // Context에 데이터가 없으면 API에서 다시 가져오기
          console.log("Fetching result from API...");
          const response = await getResultBase64(jobId);
          
          if (response.success) {
            const byteCharacters = atob(response.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const mimeType = response.format === 'mp4' ? 'video/mp4' : 'image/jpeg';
            const blob = new Blob([byteArray], { type: mimeType });
            const videoUrl = URL.createObjectURL(blob);
            setResultVideoUrl(videoUrl);
          } else {
            throw new Error(response.error || "결과를 불러올 수 없습니다.");
          }
        }
      } catch (error) {
        console.error("결과 로딩 실패:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();

    // 클린업
    return () => {
      if (resultVideoUrl) {
        URL.revokeObjectURL(resultVideoUrl);
      }
    };
  }, [jobId, navigate, resultData]);

  const handleDownload = async () => {
    try {
      const blob = await downloadResult(jobId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facefusion_result_${jobId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("다운로드 실패:", error);
      alert("다운로드에 실패했습니다.");
    }
  };

  const handleCleanup = async () => {
    if (jobId) {
      try {
        await cleanupFiles(jobId);
        setJobId(null);
      } catch (error) {
        console.error("파일 정리 실패:", error);
      }
    }
  };

  const handlePreventionClick = async () => {
    // 예방법 페이지로 이동하기 전에 파일 정리
    await handleCleanup();
    navigate("/prevention");
  };

  if (isLoading) {
    return (
      <Container>
        <ContentBox>
          <Title>결과 로딩 중...</Title>
          <Description>페이스퓨전 결과를 불러오고 있습니다.</Description>
        </ContentBox>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ContentBox>
          <Title>오류 발생</Title>
          <Description>결과를 불러오는 중 오류가 발생했습니다: {error}</Description>
          <ButtonContainer>
            <Button onClick={() => navigate("/situation")}>
              다시 시도하기
            </Button>
          </ButtonContainer>
        </ContentBox>
      </Container>
    );
  }

  return (
    <Container>
      <ContentBox>
        <Title>페이스퓨전 결과</Title>
        <Description>
          생성된 페이스퓨전 영상을 확인해 보세요. 당신의 얼굴이 영상에 합성되었습니다.
        </Description>
        <VideoContainer>
          {resultVideoUrl ? (
            <Video controls>
              <source src={resultVideoUrl} type="video/mp4" />
              브라우저가 비디오 재생을 지원하지 않습니다.
            </Video>
          ) : (
            <div style={{padding: '2rem', color: 'white', textAlign: 'center'}}>
              영상을 불러오는 중...
            </div>
          )}
        </VideoContainer>
        <TimelineContainer>
          <TimelineBar>
            <TimelineMarker style={{ left: "20%" }} time="0:05" />
            <TimelineMarker style={{ left: "50%" }} time="0:12" />
            <TimelineMarker style={{ left: "80%" }} time="0:18" />
          </TimelineBar>
          <TimelineLabel>
            <span>시작</span>
            <span>종료</span>
          </TimelineLabel>
        </TimelineContainer>
        <AnalysisList>
          <AnalysisItem>
            <ItemIcon>👁️</ItemIcon>
            <ItemContent>
              <ItemTitle>표정 변화</ItemTitle>
              <ItemText>
                0:05 - 눈과 입의 움직임이 부자연스럽게 변화하는 것을 
                확인할 수 있습니다. 특히 감정 표현 시 미세한 근육의 
                움직임이 부자연스럽습니다.
              </ItemText>
            </ItemContent>
          </AnalysisItem>
          <AnalysisItem>
            <ItemIcon>💬</ItemIcon>
            <ItemContent>
              <ItemTitle>음성 동기화</ItemTitle>
              <ItemText>
                0:12 - 음성과 입 모양의 동기화가 완벽하지 않습니다. 
                특히 빠른 발화 시 입 모양과 소리가 일치하지 않는 
                현상이 발생합니다.
              </ItemText>
            </ItemContent>
          </AnalysisItem>
          <AnalysisItem>
            <ItemIcon>🎭</ItemIcon>
            <ItemContent>
              <ItemTitle>얼굴 경계</ItemTitle>
              <ItemText>
                0:18 - 머리카락과 얼굴이 만나는 부분, 특히 측면에서 
                부자연스러운 경계가 관찰됩니다. 빛의 반사와 그림자가 
                실제와 다르게 표현됩니다.
              </ItemText>
            </ItemContent>
          </AnalysisItem>
        </AnalysisList>
        <WarningBox>
          <WarningTitle>식별 포인트</WarningTitle>
          <WarningText>
            딥페이크 영상은 전체적으로 자연스러워 보일 수 있으나, 
            세밀한 부분에서 부자연스러움이 발견됩니다. 특히 빠른 
            움직임이나 급격한 각도 변화 시 더욱 두드러집니다.
          </WarningText>
        </WarningBox>
        <ButtonContainer>
          <DownloadButton onClick={handleDownload}>
            영상 다운로드
          </DownloadButton>
          <Button secondary onClick={() => {
            playNavigationSound('back');
            navigate("/situation");
          }}>
            다른 영상으로 시도
          </Button>
          <Button onClick={() => {
            playNavigationSound('next');
            handlePreventionClick();
          }}>
            예방법 알아보기
          </Button>
        </ButtonContainer>
      </ContentBox>
    </Container>
  );
} 