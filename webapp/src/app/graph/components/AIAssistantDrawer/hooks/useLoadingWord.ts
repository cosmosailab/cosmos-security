import { useState, useEffect } from 'react';

export const LOADING_STATUS_WORDS = [
  '네트워크와 협상 중...',
  '비트들에게 부탁하는 중...',
  '서버를 설득하는 중...',
  '패킷 사이를 읽는 중...',
  '타겟을 엿보는 중...',
  '방화벽과 친해지는 중...',
  '바이트들에게 협력을 가르치는 중...',
  '토폴로지를 풀어내는 중...',
  '데이터가 안정될 때까지 대기 중...',
  'DNS에게 속삭이는 중...',
  '흔적을 수집하는 중...',
  '와이어를 따라가는 중...',
  '점들을 연결하는 중...',
  '실마리 당기는 중...',
  '지도 펼치는 중...',
  '그래프 예열하는 중...',
  '느슨한 끝을 쫓는 중...',
  '노이즈 걸러내는 중...',
  '구석구석 살피는 중...',
  '큰 그림을 그리는 중...',
  '신호에 주파수를 맞추는 중...',
  '조각 맞추는 중...',
  '퍼즐 만드는 중...',
  '흔적을 추적하는 중...',
  '조금 더 깊이 파는 중...',
  '거의 다 왔어요, 아마도...',
  '데이터와 친구 되는 중...',
  '레이어를 체로 거르는 중...',
  '와이어에 귀 기울이는 중...',
  '지형을 매핑하는 중...',
  '살살 둘러보는 중...',
  '엔드포인트를 달래는 중...',
  '응답을 풀어보는 중...',
  '대화를 디코딩하는 중...',
  '라우터 구슬리는 중...',
  '서비스를 슬쩍 찔러보는 중...',
  '레코드 넘겨보는 중...',
  '한 패킷씩 차근차근...',
  '조용히 정보를 수집하는 중...',
  '세부 사항을 읽는 중...',
  '내부를 점검하는 중...',
  '모든 문을 두드리는 중...',
  '조각들을 꿰매는 중...',
  '잠시만요, 그래프 굽는 중...',
  '결과를 모아오는 중...',
  '스택을 살금살금 지나는 중...',
  '대역폭 좀 빌리는 중...',
  '프로토콜을 설득하는 중...',
  '돌 하나하나 뒤집어보는 중...',
  '표면을 측정하는 중...',
];

function useRotatingWord(words: string[], intervalMs = 2500) {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * words.length),
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => {
        let next: number;
        do {
          next = Math.floor(Math.random() * words.length);
        } while (next === prev && words.length > 1);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [words.length, intervalMs]);
  return words[index];
}

export function useLoadingWord(): string {
  return useRotatingWord(LOADING_STATUS_WORDS);
}
