// ============================================
// Edge Functions 설정
// ============================================
// Vercel Edge Functions로 실행 (V8 Isolates 사용)
// - Cold Start 0ms (vs Serverless 250-980ms)
// - 전 세계 엣지 로케이션에서 실행
// - Web Standard API 사용 (Request/Response)
// - maxDuration: 30초 타임아웃 (Pro 플랜, 5개 병렬 API 요청 처리)
export const config = {
  runtime: 'edge',
  maxDuration: 30,
};

export default async function handler(req) {
  // CORS 헤더 설정
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // GET 메서드만 허용
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // URL에서 쿼리 파라미터 추출 (Web Standard API)
    const url = new URL(req.url);
    const date = url.searchParams.get('date');

    // API 키 검증
    const API_KEY = process.env.NEIS_API_KEY;
    if (!API_KEY) {
      console.error('❌ NEIS_API_KEY 환경 변수가 설정되지 않았습니다.');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'API 키가 설정되지 않았습니다. Vercel 환경 변수를 확인해주세요.'
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const ATPT_OFCDC_SC_CODE = "C10"; // 교육청 코드 (충청남도교육청)
    const SD_SCHUL_CODE = "7150397"; // 학교 코드
    const MLSV_YMD = date;

    const apiUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${SD_SCHUL_CODE}&MLSV_YMD=${MLSV_YMD}`;

    console.log('🔍 API 호출:', {
      날짜: MLSV_YMD,
      교육청코드: ATPT_OFCDC_SC_CODE,
      학교코드: SD_SCHUL_CODE,
      API_KEY_존재: !!API_KEY,
      URL: apiUrl.replace(API_KEY, 'HIDDEN')
    });

    const response = await fetch(apiUrl);

    // HTTP 상태 코드 확인
    if (!response.ok) {
      console.error('❌ NEIS API HTTP 에러:', response.status, response.statusText);
      return new Response(
        JSON.stringify({
          success: false,
          error: `NEIS API 호출 실패 (HTTP ${response.status})`
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const data = await response.json();
    console.log('📥 NEIS API 응답:', JSON.stringify(data, null, 2));

    // NEIS API 에러 응답 체크
    if (data.RESULT) {
      const errorCode = data.RESULT.CODE;
      const errorMsg = data.RESULT.MESSAGE;

      if (errorCode === 'INFO-200') {
        // 정상적으로 데이터가 없는 경우 (주말, 공휴일 등)
        console.log('ℹ️ 급식 데이터 없음:', errorMsg);
        return new Response(
          JSON.stringify({
            success: true,
            menu: [],
            date: MLSV_YMD,
            message: '해당 날짜의 급식 정보가 없습니다.'
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
          }
        );
      } else {
        // 실제 에러 (인증 실패, 잘못된 파라미터 등)
        console.error('❌ NEIS API 에러:', errorCode, errorMsg);
        return new Response(
          JSON.stringify({
            success: false,
            error: `NEIS API 에러: ${errorMsg} (${errorCode})`
          }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // 성공 응답 처리 (안전한 데이터 접근)
    if (data.mealServiceDietInfo && Array.isArray(data.mealServiceDietInfo)) {
      const mealData = data.mealServiceDietInfo.find(item => item.row);

      if (mealData && mealData.row && Array.isArray(mealData.row)) {
        console.log('✅ 급식 데이터 조회 성공:', mealData.row.length, '개');
        // CDN 캐싱: 1시간, Stale 상태에서도 24시간 재사용
        return new Response(
          JSON.stringify({
            success: true,
            menu: mealData.row,
            date: MLSV_YMD
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
          }
        );
      }
    }

    // 예상치 못한 응답 구조
    console.warn('⚠️ 예상치 못한 응답 구조:', data);
    return new Response(
      JSON.stringify({
        success: true,
        menu: [],
        date: MLSV_YMD,
        message: '급식 정보를 찾을 수 없습니다.'
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );

  } catch (error) {
    console.error('API 호출 실패:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: '급식 정보를 불러오는데 실패했습니다.'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
