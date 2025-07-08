import { useState, useEffect } from 'react'
import './App.css'

function App() {
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // 1. Ajouter un état de chargement

    useEffect(() => {
        // Le proxy Nginx redirige /api vers le backend
        fetch('/api/organization-chart')
            .then(response => {
                if (!response.ok) {
                    throw new Error('La réponse du réseau n\'était pas bonne');
                }
                return response.json();
            })
            .then(data => {
                setEmployees(data);
            })
            .catch(error => {
                console.error("Fetch error:", error);
                setError("Impossible de charger les données de l'organigramme.");
            })
            .finally(() => {
                setLoading(false); // 2. Arrêter le chargement dans tous les cas
            });
    }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une fois

    // 3. Afficher un message pendant le chargement
    if (loading) {
        return <div>Chargement en cours...</div>;
    }

    return (
        <>
            <h1>Organigramme de l&apos;Entreprise</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <pre>
                <code>
                    {JSON.stringify(employees, null, 2)}
                </code>
            </pre>
        </>
    )
}

export default App
