
const token = 'sbp_5a26d174e1020dc206865529cd0e0c1f4f5c288e';

async function listProjects() {
    try {
        const response = await fetch('https://api.supabase.com/v1/projects', {
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

listProjects();
