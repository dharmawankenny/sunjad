// These are the pages you can go to.
// They are all wrapped in the App component, which should contain the navbar etc
// See http://blog.mxstbr.com/2016/01/react-apps-with-pages for more information
// about the code splitting business
import { getAsyncInjectors } from 'utils/asyncInjectors';

const errorLoading = (err) => {
  console.error('Dynamic page loading failed', err); // eslint-disable-line no-console
};

const loadModule = (cb) => (componentModule) => {
  cb(null, componentModule.default);
};

export default function createRoutes(store) {
  // Create reusable async injectors using getAsyncInjectors factory
  const { injectReducer, injectSagas } = getAsyncInjectors(store); // eslint-disable-line no-unused-vars

  return [
    {
      path: '/susunjadwal/',
      name: 'home',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/HomePage'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([component]) => {
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/susunjadwal/susun',
      name: 'buildSchedule',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/BuildSchedule/reducer'),
          System.import('containers/BuildSchedule/sagas'),
          System.import('containers/BuildSchedule'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('buildSchedule', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/susunjadwal/jadwal',
      name: 'jadwal',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/Jadwal/reducer'),
          System.import('containers/Jadwal/sagas'),
          System.import('containers/Jadwal'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('jadwal', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/susunjadwal/jadwal/:slug',
      name: 'jadwalSpesifik',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/JadwalSpesifik/reducer'),
          System.import('containers/JadwalSpesifik/sagas'),
          System.import('containers/JadwalSpesifik'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('jadwalSpesifik', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/susunjadwal/gabung',
      name: 'gabungJadwal',
      getComponent(nextState, cb) {
        const importModules = Promise.all([
          System.import('containers/GabungJadwal/reducer'),
          System.import('containers/GabungJadwal/sagas'),
          System.import('containers/GabungJadwal'),
        ]);

        const renderRoute = loadModule(cb);

        importModules.then(([reducer, sagas, component]) => {
          injectReducer('gabungJadwal', reducer.default);
          injectSagas(sagas.default);
          renderRoute(component);
        });

        importModules.catch(errorLoading);
      },
    }, {
      path: '/susunjadwal/logout',
      name: 'logoutModule',
      getComponent(location, cb) {
        System.import('containers/LogoutModule')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    }, {
      path: '/susunjadwal/*',
      name: 'notfound',
      getComponent(nextState, cb) {
        System.import('containers/NotFoundPage')
          .then(loadModule(cb))
          .catch(errorLoading);
      },
    },
  ];
}
