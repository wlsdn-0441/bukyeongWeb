export default async function handler(req, res) {
  // CORS 설정 (필요시)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date } = req.query; // 날짜를 쿼리로 받음

    // API 키 검증
    const API_KEY = process.env.NEIS_API_KEY;
    if (!API_KEY) {
      console.error('❌ NEIS_API_KEY 환경 변수가 설정되지 않았습니다.');
      return res.status(500).json({
        success: false,
        error: 'API 키가 설정되지 않았습니다. Vercel 환경 변수를 확인해주세요.'
      });
    }

    const ATPT_OFCDC_SC_CODE = "C10"; // 교육청 코드 (충청남도교육청)
    const SD_SCHUL_CODE = "7150397"; // 학교 코드
    const MLSV_YMD = date;

    const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${SD_SCHUL_CODE}&MLSV_YMD=${MLSV_YMD}`;

    console.log('🔍 API 호출:', {
      날짜: MLSV_YMD,
      교육청코드: ATPT_OFCDC_SC_CODE,
      학교코드: SD_SCHUL_CODE,
      API_KEY_존재: !!API_KEY,
      URL: url.replace(API_KEY, 'HIDDEN')
    });

    const response = await fetch(url);

    // HTTP 상태 코드 확인
    if (!response.ok) {
      console.error('❌ NEIS API HTTP 에러:', response.status, response.statusText);
      return res.status(500).json({
        success: false,
        error: `NEIS API 호출 실패 (HTTP ${response.status})`
      });
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
        return res.status(200).json({
          success: true,
          menu: [],
          date: MLSV_YMD,
          message: '해당 날짜의 급식 정보가 없습니다.'
        });
      } else {
        // 실제 에러 (인증 실패, 잘못된 파라미터 등)
        console.error('❌ NEIS API 에러:', errorCode, errorMsg);
        return res.status(500).json({
          success: false,
          error: `NEIS API 에러: ${errorMsg} (${errorCode})`
        });
      }
    }

    // 성공 응답 처리 (안전한 데이터 접근)
    if (data.mealServiceDietInfo && Array.isArray(data.mealServiceDietInfo)) {
      const mealData = data.mealServiceDietInfo.find(item => item.row);

      if (mealData && mealData.row && Array.isArray(mealData.row)) {
        console.log('✅ 급식 데이터 조회 성공:', mealData.row.length, '개');
        return res.status(200).json({
          success: true,
          menu: mealData.row,
          date: MLSV_YMD
        });
      }
    }

    // 예상치 못한 응답 구조
    console.warn('⚠️ 예상치 못한 응답 구조:', data);
    return res.status(200).json({
      success: true,
      menu: [],
      date: MLSV_YMD,
      message: '급식 정보를 찾을 수 없습니다.'
    });

  } catch (error) {
    console.error('API 호출 실패:', error);
    return res.status(500).json({ 
      success: false, 
      error: '급식 정보를 불러오는데 실패했습니다.' 
    });
  }
}