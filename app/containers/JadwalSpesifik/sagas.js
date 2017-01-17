import { takeLatest } from 'redux-saga';
import { LOCATION_CHANGE, push } from 'react-router-redux';
import { take, call, select, cancel, fork, put } from 'redux-saga/effects';
import { FETCH } from './constants';
import { isEmpty, isEqual } from 'lodash';
import { fetchDone } from './actions';
import request from 'utils/request';
import { loading, loadingDone, loadingErr } from 'containers/App/actions';

export function* fetchScheduleData(action) {
  yield put(loading());
	let requestURL = `http://ristek.cs.ui.ac.id/susunjadwal/api/jadwals/${action.slug}`;

  let jobId = action.slug.split(',');

  if(jobId.length > 1) {
    requestURL = `http://ristek.cs.ui.ac.id/susunjadwal/api/jadwals/join?jadwals=${action.slug}`;
    
    const fetchScheduleDataCall = yield call(request, requestURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if(!fetchScheduleDataCall.err || !(fetchScheduleDataCall.err === 'SyntaxError: Unexpected end of JSON input')) {
      if(fetchScheduleDataCall.data) {
        yield put(fetchDone(fetchScheduleDataCall.data.jadwals));
        yield put(loadingDone());
      } else {
        yield put(loadingErr());
      }
    } else {
      yield put(loadingErr());
    }
  } else {
  	const fetchScheduleDataCall = yield call(request, requestURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if(!fetchScheduleDataCall.err || !(fetchScheduleDataCall.err === 'SyntaxError: Unexpected end of JSON input')) {
      if(fetchScheduleDataCall.data) {
        yield put(fetchDone(fetchScheduleDataCall.data.jadwals));
        yield put(loadingDone());
      } else {
        yield put(loadingErr());
      }
    } else {
      yield put(loadingErr());
    }
  }
}

/**
 * Watches for LOAD_REPOS action and calls handler
 */
export function* fetchScheduleSaga() {
  yield takeLatest(FETCH, fetchScheduleData);
}

/**
 * Root saga manages watcher lifecycle
 */
export function* jadwalSpesifikSaga() {
  // Fork watcher so we can continue execution
  const fetchScheduleWatcher = yield fork(fetchScheduleSaga);

  yield take(LOCATION_CHANGE);
  yield cancel(fetchScheduleWatcher);
}

// Bootstrap sagas
export default [
 jadwalSpesifikSaga,
];
