// 사운드 재생 유틸리티
const playSound = (soundFile) => {
  try {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.volume = 0.7; // 볼륨 조절
    audio.play().catch(error => {
      console.log('Sound play failed:', error);
    });
  } catch (error) {
    console.log('Sound creation failed:', error);
  }
};

// 각 상황별 사운드 재생 함수들
export const playStartSound = () => playSound('start_button.wav');
export const playNextSound = () => playSound('next_button.wav');
export const playBackSound = () => playSound('back_button.wav');
export const playQuizCorrectSound = () => playSound('Quiz_o.wav');
export const playQuizWrongSound = () => playSound('Quiz_x.wav');
export const playCardChoiceSound = () => playSound('Card_choice.wav');

// 네비게이션 방향에 따른 자동 사운드 재생
export const playNavigationSound = (action) => {
  switch (action) {
    case 'start':
      playStartSound();
      break;
    case 'next':
    case 'experience':
    case 'agree':
    case 'confirm':
      playNextSound();
      break;
    case 'back':
    case 'previous':
    case 'retry':
      playBackSound();
      break;
    case 'card':
      playCardChoiceSound();
      break;
    case 'quiz_correct':
      playQuizCorrectSound();
      break;
    case 'quiz_wrong':
      playQuizWrongSound();
      break;
    default:
      // 기본적으로 다음 버튼 사운드
      playNextSound();
  }
}; 