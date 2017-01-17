import { takeLatest } from 'redux-saga';
import { LOCATION_CHANGE, push } from 'react-router-redux';
import { take, call, select, cancel, fork, put } from 'redux-saga/effects';
import { FETCH, SET_JADWAL_UTAMA } from './constants';
import { isEmpty, isEqual } from 'lodash';
import selectGlobal from 'containers/App/selectors';
import selectJadwal from './selectors';
import { fetchDone, fetchPrimarySchedule } from './actions';
import request from 'utils/request';
import { loading, loadingDone, loadingErr } from 'containers/App/actions';

/**
 * Github repos request/response handler
 */
export function* fetchUserData(action) {
  yield put(loading());
	const globalState = yield select(selectGlobal());
  let userId = globalState.user_id;
  let token = globalState.token;
  
  if(userId === '') {
    userId = action.userId;
  }

  if(token === '') {
    token = action.token;
  }

  const requestURL = `http://ristek.cs.ui.ac.id/susunjadwal/api/users/${userId}/jadwals`;
  const auth = `Bearer ${token}`;

  const fetchUserDataCall = yield call(request, requestURL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Authorization': auth,
    },
  });

  if(!fetchUserDataCall.err || !(fetchUserDataCall.err === 'SyntaxError: Unexpected end of JSON input')) {
    if(fetchUserDataCall.data.jadwals.length > 0) {
    	let primaryScheduleID = '';

    	fetchUserDataCall.data.jadwals.map((value, key) => {
    		if(value.utama) {
    			primaryScheduleID = value.id;
    		}
    	});

    	const requestURLPrimarySched = `http://ristek.cs.ui.ac.id/susunjadwal/api/jadwals/${primaryScheduleID}`;

    	const fetchPrimaryScheduleCall = yield call(request, requestURLPrimarySched, {
  	    method: 'GET',
  	    headers: {
  	      Accept: 'application/json',
  	      'Content-Type': 'application/json',
  	    },
  	  });

    	if(!fetchPrimaryScheduleCall.err || !(fetchPrimaryScheduleCall.err === 'SyntaxError: Unexpected end of JSON input')) {
    		if(fetchPrimaryScheduleCall.data) {
          yield put(fetchDone(fetchPrimaryScheduleCall.data.jadwals, fetchUserDataCall.data.jadwals));
          yield put(loadingDone());
        } else {
          yield put(fetchDone([], fetchUserDataCall.data.jadwals));
          yield put(loadingDone());
        }
    	} else {
        yield put(fetchDone([], fetchUserDataCall.data.jadwals));
        yield put(loadingDone());
    	}
    } else {
      yield put(fetchDone([], fetchUserDataCall.data.jadwals));
      yield put(loadingDone());
    }      
  } else {
    yield put(loadingErr());
  }
}

/**
 * Watches for LOAD_REPOS action and calls handler
 */
export function* fetchUserDataSaga() {
  yield takeLatest(FETCH, fetchUserData);
}

/**
 * Github repos request/response handler
 */
export function* changePrimary(action) {
  yield put(loading());
	const globalState = yield select(selectGlobal());
  const requestURL = `http://ristek.cs.ui.ac.id/susunjadwal/api/users/${globalState.user_id}/jadwals/${action.id}/set-utama`;
  const auth = `Bearer ${globalState.token}`;

  const changePrimaryCall = yield call(request, requestURL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Authorization': auth,
    },
    body: JSON.stringify({}),
  });

  if(!changePrimaryCall.err || !(changePrimaryCall.err === 'SyntaxError: Unexpected end of JSON input')) {
  	const requestURLPrimarySched = `http://ristek.cs.ui.ac.id/susunjadwal/api/jadwals/${action.id}`;

  	const fetchPrimaryScheduleCall = yield call(request, requestURLPrimarySched, {
	    method: 'GET',
	    headers: {
	      Accept: 'application/json',
	      'Content-Type': 'application/json',
	    },
	  });

  	if(!fetchPrimaryScheduleCall.err || !(fetchPrimaryScheduleCall.err === 'SyntaxError: Unexpected end of JSON input')) {
      if(fetchPrimaryScheduleCall.data) {
  		  yield put(fetchPrimarySchedule(fetchPrimaryScheduleCall.data.jadwals));
        yield put(loadingDone());
      } else {
        yield put(loadingErr());
      }
  	} else {
      yield put(loadingErr());
  	}
  } else {
    yield put(loadingErr());
  }
}

/**
 * Watches for LOAD_REPOS action and calls handler
 */
export function* changePrimarySaga() {
  yield takeLatest(SET_JADWAL_UTAMA, changePrimary);
}

/**
 * Root saga manages watcher lifecycle
 */
export function* jadwalSaga() {
  // Fork watcher so we can continue execution
  const fetchUserDataWatcher = yield fork(fetchUserDataSaga);
  const changePrimaryWatcher = yield fork(changePrimarySaga);
  
  yield take(LOCATION_CHANGE);
  yield cancel(fetchUserDataWatcher);
  yield cancel(changePrimaryWatcher);
}

// Bootstrap sagas
export default [
 jadwalSaga,
];
