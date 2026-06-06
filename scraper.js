const { chromium } = require('playwright');
const fs = require('fs');

(async () => {

    const browser = await chromium.launch({
        headless: true
    });

    const page = await browser.newPage();

    await page.goto(
        'https://www.ycombinator.com/jobs',
        {
            waitUntil: 'networkidle'
        }
    );

    await page.waitForTimeout(5000);

    const links = await page.$$eval(
        'a',
        elements =>
            elements.map(el => ({
                text: el.innerText.trim(),
                url: el.href
            }))
    );

    const jobs = links
        .filter(item =>
            item.url.includes('/companies/') &&
            item.url.includes('/jobs/') &&
            item.text.length > 3
        )
        .map(item => {

            const match =
                item.url.match(
                    /companies\/([^/]+)\/jobs/
                );

            return {
                company_name:
                    match ? match[1] : null,

                job_title:
                    item.text,

                job_url:
                    item.url,

                collected_at:
                    new Date().toISOString()
            };
        });

    fs.mkdirSync('data', { recursive: true });

    fs.writeFileSync(
        'data/clean_jobs.json',
        JSON.stringify(jobs, null, 2)
    );

    console.log(
        `Collected ${jobs.length} real job records`
    );


    console.log("Total links:", links.length);
console.log("Filtered jobs:", jobs.length);


    await browser.close();

})();