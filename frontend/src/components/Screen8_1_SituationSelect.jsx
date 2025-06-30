import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useDeepfake } from "../context/DeepfakeContext";
import { getVideoList, startFaceFusion } from "../services/api";
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

const ScenarioList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 3rem;
`;

const ScenarioCard = styled.button`
  background: ${props => props.selected ? 'rgba(227, 24, 55, 0.1)' : 'white'};
  border: 2px solid ${props => props.selected ? '#E31837' : '#ddd'};
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    border-color: #E31837;
    background: ${props => props.selected ? 'rgba(227, 24, 55, 0.1)' : 'rgba(227, 24, 55, 0.05)'};
  }
`;

const ScenarioTitle = styled.h3`
  color: ${props => props.selected ? '#E31837' : '#333'};
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: ${props => props.selected ? '600' : '500'};
`;

const ScenarioDesc = styled.p`
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
`;

const scenarios = {
  work: [
    {
      id: "work1",
      title: "화상 회의 사칭",
      description: "화상 회의에서 상사나 동료의 모습으로 사칭하여 기밀 정보를 요구하는 상황"
    },
    {
      id: "work2",
      title: "업무 지시 사칭",
      description: "메신저나 이메일로 상사를 사칭하여 자금 이체를 요구하는 상황"
    },
    {
      id: "work3",
      title: "인터뷰 영상 조작",
      description: "회사 인터뷰나 발표 영상이 조작되어 잘못된 정보가 퍼지는 상황"
    }
  ],
  sns: [
    {
      id: "sns1",
      title: "프로필 도용",
      description: "SNS 프로필 사진이 도용되어 가짜 계정이 만들어지는 상황"
    },
    {
      id: "sns2",
      title: "라이브 방송 사칭",
      description: "실시간 방송에서 유명인을 사칭하여 사기를 치는 상황"
    },
    {
      id: "sns3",
      title: "허위 정보 유포",
      description: "조작된 영상으로 허위 정보나 루머를 퍼뜨리는 상황"
    }
  ],
  personal: [
    {
      id: "personal1",
      title: "메신저 사칭",
      description: "가족이나 친구를 사칭하여 금전을 요구하는 상황"
    },
    {
      id: "personal2",
      title: "데이팅 앱 사칭",
      description: "데이팅 앱에서 다른 사람의 사진을 도용하여 속이는 상황"
    },
    {
      id: "personal3",
      title: "개인 영상 유출",
      description: "개인적인 영상이 딥페이크로 조작되어 유포되는 상황"
    }
  ],
  financial: [
    {
      id: "financial1",
      title: "보이스피싱",
      description: "가족이나 지인의 목소리로 위장하여 금전을 요구하는 상황"
    },
    {
      id: "financial2",
      title: "인증 영상 조작",
      description: "본인 인증용 영상이 조작되어 금융 사기에 악용되는 상황"
    },
    {
      id: "financial3",
      title: "투자 사기",
      description: "유명 투자자를 사칭하여 허위 투자 정보를 제공하는 상황"
    }
  ]
};

export default function Screen8_1_SituationSelect() {
  const navigate = useNavigate();
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { 
    capturedImage, 
    videoList, 
    setVideoList,
    setSelectedVideoId: setContextVideoId, 
    setJobId,
    setProcessingStatus 
  } = useDeepfake();

  // 영상 목록 불러오기
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await getVideoList();
        setVideoList(response.videos || []);
      } catch (error) {
        console.error("영상 목록 불러오기 실패:", error);
        alert("영상 목록을 불러올 수 없습니다.");
      }
    };
    
    loadVideos();
  }, [setVideoList]);

  const handleNext = async () => {
    if (!selectedVideoId || !capturedImage) {
      alert("영상을 선택하고 얼굴 사진이 있는지 확인해주세요.");
      return;
    }

    setIsLoading(true);
    setProcessingStatus('starting');
    
    try {
      const response = await startFaceFusion(capturedImage, selectedVideoId);
      
      if (response.success) {
        setJobId(response.job_id);
        setContextVideoId(selectedVideoId);
        setProcessingStatus('processing');
        navigate("/video");
      } else {
        throw new Error(response.error || "처리 실패");
      }
    } catch (error) {
      console.error("페이스퓨전 시작 실패:", error);
      alert("페이스퓨전을 시작할 수 없습니다: " + error.message);
      setProcessingStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <ContentBox>
        <Title>영상 선택</Title>
        <Description>
          페이스퓨전을 적용할 영상을 선택해 주세요.
        </Description>
        <ScenarioList>
          {videoList.length > 0 ? (
            videoList.map(video => (
              <ScenarioCard
                key={video.id}
                selected={selectedVideoId === video.id}
                onClick={() => setSelectedVideoId(video.id)}
                disabled={isLoading}
              >
                <ScenarioTitle selected={selectedVideoId === video.id}>
                  영상 {video.id}: {video.filename}
                </ScenarioTitle>
                <ScenarioDesc>
                  이 영상에 당신의 얼굴을 합성합니다.
                </ScenarioDesc>
              </ScenarioCard>
            ))
          ) : (
            <ScenarioDesc style={{textAlign: 'center', padding: '2rem'}}>
              영상을 불러오는 중...
            </ScenarioDesc>
          )}
        </ScenarioList>
        <WarningBox>
          <WarningTitle>주의사항</WarningTitle>
          <WarningText>
            선택하신 상황은 실제 피해 사례를 바탕으로 재구성되었습니다.
            실제 상황에서는 더욱 주의가 필요합니다.
          </WarningText>
        </WarningBox>
        <ButtonContainer>
          <Button 
            secondary 
            onClick={() => navigate("/situation")}
            disabled={isLoading}
          >
            이전으로
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!selectedVideoId || isLoading}
            style={{ opacity: !selectedVideoId || isLoading ? 0.5 : 1 }}
          >
            {isLoading ? "페이스퓨전 시작 중..." : "페이스퓨전 시작"}
          </Button>
        </ButtonContainer>
      </ContentBox>
    </Container>
  );
} 