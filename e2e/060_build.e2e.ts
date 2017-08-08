import { browser, by, element, ExpectedConditions } from 'protractor';
import { isLoaded, login, logout, waitForUrlToChangeTo, delay } from './utils';
import { request, header } from '../tests/e2e/webhooks/github/PushEvent';
import { sendGitHubRequest } from '../tests/e2e/utils/utils';

function randomNumber(minimum: number, maximum: number): number {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

describe('Build Details', () => {
  beforeAll(() => login().then(() => browser.waitForAngularEnabled(false)));
  afterAll(() => logout().then(() => browser.waitForAngularEnabled(true)));

  it('should restart existing build', () => {
    return browser.get('/build/1')
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt > 0;
      })))
      .then((): any => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === 0;
      })))
      .then((): any => browser.wait(() => element(by.css('[name="restart-build"]')).isPresent()))
      .then((): any => element(by.css('[name="restart-build"]')).click())
      .then((): any => element.all(by.css('.list-item')).count())
      .then(num => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === num;
      })))
      .then(() => element.all(by.css('[name="stop-job"]')).each(el => el.click()))
      .then(num => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === 0;
      })));
  });

  it('should restart first job', () => {
    return Promise.resolve()
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt > 0;
      })))
      .then((): any => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === 0;
      })))
      .then((): any => {
        return browser
          .wait(() => element.all(by.css('[name="restart-job"]')).first().isPresent());
      })
      .then((): any => element.all(by.css('[name="restart-job"]')).first().click())
      .then((): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 1));
      })
      .then((): any => {
        return browser.wait(() => element.all(by.css('.job-time')).then(els => els[0])
          .then(el => el.getAttribute('innerHTML').then(html => html === '00:05')));
      })
      .then((): any => {
        return browser
          .wait(() => element.all(by.css('[name="stop-job"]')).first().isPresent());
      })
      .then((): any => element.all(by.css('[name="stop-job"]')).first().click())
      .then((num): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 0));
      });
  });

  it('should restart last job', () => {
    return Promise.resolve()
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt > 0;
      })))
      .then((): any => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === 0;
      })))
      .then((): any => {
        return browser
          .wait(() => element.all(by.css('[name="restart-job"]')).last().isPresent());
      })
      .then((): any => element.all(by.css('[name="restart-job"]')).last().click())
      .then((): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 1));
      })
      .then((): any => {
        return browser.wait(() => element.all(by.css('.job-time')).then(els => els[els.length - 1])
          .then(el => el.getAttribute('innerHTML').then(html => html === '00:05')));
      })
      .then((): any => {
        return browser
          .wait(() => element.all(by.css('[name="stop-job"]')).last().isPresent());
      })
      .then((): any => element.all(by.css('[name="stop-job"]')).last().click())
      .then((num): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 0));
      });
  });

  it('should restart random job', () => {
    let num = null;
    return Promise.resolve()
      .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
        return cnt > 0;
      })))
      .then((): any => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
        return cnt === 0;
      })))
      .then((): any => element.all(by.css('.list-item')).count())
      .then(numJobs => num = randomNumber(0, numJobs - 1))
      .then((): any => {
        return browser.wait(() => {
          return element.all(by.css(`[name="restart-job"]`)).then(els => els[num])
            .then(el => el.isPresent());
        });
      })
      .then((): any => {
        return element.all(by.css(`[name="restart-job"]`))
          .then(els => els[num])
          .then(el => el.click());
      })
      .then((): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 1));
      })
      .then((): any => {
        return browser.wait(() => element.all(by.css('.job-time')).then(els => els[num])
          .then(el => el.getAttribute('innerHTML').then(html => html === '00:05')));
      })
      .then((): any => {
        return browser.wait(() => {
          return element.all(by.css(`[name="stop-job"]`)).then(els => els[num])
            .then(el => el.isPresent());
        });
      })
      .then((): any => {
        return element.all(by.css(`[name="stop-job"]`)).then(els => els[num])
          .then(el => el.click());
      })
      .then((num): any => {
        return browser.wait(() => element.all(by.css('.is-running')).count()
          .then(cnt => cnt === 0));
      });
  });

  // it('should restart all jobs', () => {
  //   return Promise.resolve()
  //     .then((): any => browser.wait(() => element.all(by.css('.list-item')).count().then(cnt => {
  //       return cnt > 0;
  //     })))
  //     .then((): any => browser.wait(() => element.all(by.css('.is-running')).count().then(cnt => {
  //       return cnt === 0;
  //     })))
  //     .then((): any => {
  //       return browser.wait(() => {
  //         return element.all(by.css(`[name="restart-job"]`)).each(el => el.isPresent());
  //       });
  //     })
  //     .then((): any => element.all(by.css(`[name="restart-job"]`)).each(el => el.click()))
  //     .then((): any => element.all(by.css('.list-item')).count())
  //     .then((num): any => {
  //       return browser.wait(() => element.all(by.css('.is-running')).count()
  //         .then(cnt => cnt === num));
  //     })
  //     .then((): any => {
  //       return browser.wait(() => element.all(by.css('.job-time')).each(el => {
  //         return el.getAttribute('innerHTML').then(html => parseInt(html, 10) > 5);
  //       }));
  //     })
  //     .then((): any => {
  //       return browser.wait(() => {
  //         return element.all(by.css(`[name="stop-job"]`)).each(el => el.isPresent());
  //       });
  //     })
  //     .then((): any => {
  //       return element.all(by.css(`[name="stop-job"]`)).each(el => el.click());
  //     })
  //     .then((num): any => {
  //       return browser.wait(() => element.all(by.css('.is-running')).count()
  //         .then(cnt => cnt === 0));
  //     });
  // });
});