
const token = 'sbp_5a26d174e1020dc206865529cd0e0c1f4f5c288e';
const projectRef = 'pjsyaeztmnslniklmsvy';

async function getProjectKeys() {
    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/api-keys`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

getProjectKeys();
