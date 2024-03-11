const axios = require('axios');

// Đặt API key của bạn ở đây
const apiKey = 'Bearer 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';

// Định nghĩa thông tin yêu cầu
const requestData = {
  prompt: 'Write a JavaScript function to reverse a string.',
  max_tokens: 100,
  n: 1,
  stop: null,
};

// Gửi yêu cầu đến OpenAI API
axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', requestData, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': apiKey,
  },
})
.then(response => {
  // Xử lý kết quả ở đây
  console.log(response.data.choices[0].text);
})
.catch(error => {
  // Xử lý lỗi ở đây
  console.error('Error:', error.message);
});
