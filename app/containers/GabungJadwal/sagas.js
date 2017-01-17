import { takeLatest } from 'redux-saga';
import { LOCATION_CHANGE, push } from 'react-router-redux';
import { take, call, select, cancel, fork, put } from 'redux-saga/effects';
import { SUBMIT } from './constants';
import { isEmpty, isEqual } from 'lodash';
import request from 'utils/request';
import selectGabungJadwal from './selectors';

export function* submitCall(action) {
	const localState = yield select(selectGabungJadwal());
	let jadwals = '';

	localState.inputs.map((value, key) => {
		let id = value.value;

		//detect if its only id or full link
		if(value.value.startsWith('http://ristek.cs.ui.ac.id/susunjadwal/jadwal/')) {
			id = value.value.replace('http://ristek.cs.ui.ac.id/susunjadwal/jadwal/', '');
		}
		if(value.value.startsWith('ristek.cs.ui.ac.id/susunjadwal/jadwal/')) {
			id = value.value.replace('ristek.cs.ui.ac.id/susunjadwal/jadwal/', '');
		}

		//if empty do not add
		if(!(id === '' || id === null)) {
			jadwals += `${id},`;
		}
	});

	//delete last ,
	if(jadwals.endsWith(',')) {
		jadwals = jadwals.substring(0, jadwals.length-1);
	}

	yield put(push(`/susunjadwal/jadwal/${jadwals}`));
}

/**
 * Watches for LOAD_REPOS action and calls handler
 */
export function* submitSaga() {
  yield takeLatest(SUBMIT, submitCall);
}

/**
 * Root saga manages watcher lifecycle
 */
export function* gabungJadwalSaga() {
  // Fork watcher so we can continue execution
  const submitWatcher = yield fork(submitSaga);
  
  yield take(LOCATION_CHANGE);
  yield cancel(submitWatcher);
}

// Bootstrap sagas
export default [
  gabungJadwalSaga,
];
