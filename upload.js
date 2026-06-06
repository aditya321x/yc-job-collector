const fs = require('fs');
const supabase = require('./supabase');

async function uploadJobs() {

    const jobs = JSON.parse(
        fs.readFileSync('./data/clean_jobs.json', 'utf8')
    );

    // Remove duplicate URLs
    const uniqueJobs = [
    ...new Map(
        jobs.map(job => [job.job_url, job])
    ).values()
];

    const records = uniqueJobs.map(job => ({
    company_name: job.company_name,
    title: job.job_title,
    job_url: job.job_url
}));

    console.log(`Uploading ${records.length} unique records`);

    const { error } = await supabase
        .from('jobs')
        .upsert(records, {
            onConflict: 'job_url'
        });

    if (error) {
        console.error(error);
    } else {
        console.log(
            `${records.length} records uploaded successfully`
        );
    }
}

uploadJobs();