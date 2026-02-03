import { useEffect, useRef } from "react";

const KAKAO_SDK_ID = "kakao-map-sdk";

export default function KakaoAddressMap({ address }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const appKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    if (!appKey) {
      console.error("VITE_KAKAO_MAP_API_KEY is missing (.env 확인 필요)");
      return;
    }

    const loadSdk = () =>
      new Promise((resolve, reject) => {
        // 이미 sdk가 로드되어 있으면 바로 resolve
        if (window.kakao && window.kakao.maps) return resolve();

        // 이미 script가 꽂혀 있으면 onload만 연결
        const existing = document.getElementById(KAKAO_SDK_ID);
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject(new Error("kakao sdk load error")));
          return;
        }

        const script = document.createElement("script");
        script.id = KAKAO_SDK_ID;
        // 주소 -> 좌표 변환을 위해 services 라이브러리 필요
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("kakao sdk load error"));
        document.head.appendChild(script);
      });

    const ensureMap = () => {
      if (!mapContainerRef.current) return;

      const kakao = window.kakao;
      kakao.maps.load(() => {
        // 최초 1회 생성
        if (!mapRef.current) {
          const center = new kakao.maps.LatLng(37.5665, 126.9780); // fallback(서울시청)
          mapRef.current = new kakao.maps.Map(mapContainerRef.current, {
            center,
            level: 3,
          });
          markerRef.current = new kakao.maps.Marker({
            position: center,
            map: mapRef.current,
          });
        }

        // 주소가 있으면 지오코딩 후 이동
        if (address && address.trim().length > 0) {
          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.addressSearch(address, (result, status) => {
            if (status === kakao.maps.services.Status.OK && result?.[0]) {
              const { x, y } = result[0];
              const pos = new kakao.maps.LatLng(Number(y), Number(x));

              // 숨김 상태였다가 나타나는 경우 대비
              mapRef.current.relayout();
              mapRef.current.setCenter(pos);
              markerRef.current.setPosition(pos);
            } else {
              // 주소 해석 실패 시에는 기본 지도 유지(에러만 로깅)
              console.warn("addressSearch failed:", status, address);
              mapRef.current.relayout();
            }
          });
        } else {
          // 주소가 비어도 relayout은 해줌
          mapRef.current.relayout();
        }
      });
    };

    loadSdk()
      .then(() => ensureMap())
      .catch((e) => console.error(e));
  }, [address]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    />
  );
}
