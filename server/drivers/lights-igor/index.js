const createToken = require('./jwt');
const Logger = require('../../logger');
const Config = require('../../config-server');
const ospath = require('path');

function igorRequest(path, method = 'POST', body) {
  const config = Config.current();

  const token = createToken(config.lightsIgor?.key);
  const url = ospath.join(config.lightsIgor?.gateway, path);
  const options = {
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  return { url, options };
}

function setLightPower(zone, on, device) {
  const path = `/api/spaces/${zone}/turn${on ? 'on' : 'off'}`;
  const request = igorRequest(path, 'POST');
  return Logger.fetchAndLog(request, 'Set Igor light', device);
}

function setLightLevel(zone, level, device) {
  const path = `/api/spaces/${zone}/lighting`;
  const request = igorRequest(path, 'POST', { level });
  return Logger.fetchAndLog(request, 'Set Igor light', device);
}

function status() {
  const path = `/api/spaces/`;
  const request = igorRequest(path);
  return Logger.fetchAndLog(request);
}

async function onCommand(command, answer) {
  const config = Config.current();
  const device = config.devices?.find(d => d.device === command.device);

  // console.log('on light command', command);
  const { zone } = device.lights;

  /* igor is 0-10000 */
  const level = parseInt(command.level) * 100;

  try {
    await setLightPower(zone, level > 0, command.device);
    if (level > 0) {
      await setLightLevel(zone, level, command.device);
    }
    answer({ result: true });
  }
  catch(e) {
    // if (e.errno !== 'ENOTFOUND') {
    //   console.log('error', e); // not network error
    // }
    answer({ error: 'Unknown error' });
  }
}

module.exports = onCommand;
