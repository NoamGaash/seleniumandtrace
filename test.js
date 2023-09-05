// @ts-check
'use strict';

import { Builder, By, WebDriver } from 'selenium-webdriver';
import { chromium } from 'playwright'

const driver = await new Builder()
  .withCapabilities({
      browserName: 'chrome',
      'goog:chromeOptions': {
          args: [] //process.env.NO_HEADLESS ? [] : ['headless']
      },
  }).build()

const cdpConnection = await driver.createCDPConnection('page');
const playwrightBrowser = await chromium.connectOverCDP(cdpConnection._wsConnection.url);

await startTracing(playwrightBrowser);
await logUrls(playwrightBrowser);
await driver.get('https://www.applitools.com/');

// await Promise.all(playwrightBrowser.contexts()
//   .map(async context => {
//     const page = await context.newPage();
//     await page.goto('https://www.google.com/');
//   }));

await logUrls(playwrightBrowser);
await driver.sleep(5000);
await logUrls(playwrightBrowser);
await endTracing(playwrightBrowser);
await driver.quit();



function logUrls(playwrightBrowser) {
  return Promise.all(playwrightBrowser.contexts().map(async context => {
    const urls = context.pages().map(page => page.url());
    console.log(urls);
  }))
}

function startTracing(playwrightBrowser) {
  return Promise.all(playwrightBrowser.contexts().map(async context => {
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
      name: 'trace name',
      sources: true,
      title: 'trace title',
    });
  }));
}

function endTracing(playwrightBrowser) {
  return Promise.all(playwrightBrowser.contexts().map(async (context, i) => {
    await context.tracing.stop({
      path: `trace-${i}-${Date.now()}.zip`
    });
  }));
}