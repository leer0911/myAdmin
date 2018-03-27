import request from '../utils/request';

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    body: params
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params
  });
}
