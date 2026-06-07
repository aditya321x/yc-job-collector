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
            item.url.includes('/jobs/') &&
            item.text.length > 3 &&
            item.text !== 'Apply'
        )
        .map(job => {

            // Company Extraction
            let company = "Unknown";

            const match = job.url.match(/companies\/([^\/]+)\//);

            if (match) {
                company = match[1];
            }

            // Job Category Detection
            let category = "Other";

            const title = job.text.toLowerCase();

            if (
                title.includes("engineer") ||
                title.includes("developer") ||
                title.includes("backend") ||
                title.includes("frontend") ||
                title.includes("full stack")
            ) {
                category = "Engineering";
            }
            else if (
                title.includes("ai") ||
                title.includes("ml") ||
                title.includes("machine learning")
            ) {
                category = "AI";
            }
            else if (
                title.includes("product")
            ) {
                category = "Product";
            }
            else if (
                title.includes("design")
            ) {
                category = "Design";
            }
            else if (
                title.includes("sales")
            ) {
                category = "Sales";
            }
            else if (
                title.includes("marketing")
            ) {
                category = "Marketing";
            }
            else if (
                title.includes("support")
            ) {
                category = "Support";
            }
            else if (
                title.includes("operations")
            ) {
                category = "Operations";
            }

            // Work Mode Detection
            let work_mode = "Onsite";

            if (
                title.includes("remote")
            ) {
                work_mode = "Remote";
            }

            return {
                title: job.text,
                url: job.url,
                company: company,
                job_category: category,
                work_mode: work_mode
            };
        });

    // Remove duplicate job URLs
    const uniqueJobs = [
        ...new Map(
            jobs.map(job => [job.url, job])
        ).values()
    ];

    fs.mkdirSync('data', { recursive: true });

    fs.writeFileSync(
        'data/clean_jobs.json',
        JSON.stringify(uniqueJobs, null, 2)
    );

    console.log(`Collected ${uniqueJobs.length} real job records`);
    console.log("Total links:", links.length);
    console.log("Filtered jobs:", uniqueJobs.length);

    await browser.close();

})();