import Card from 'react-bootstrap/Card';
import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom'
const settings = require('../api/settings.json');

function Account() {

    const [content, setContent] = useState(undefined);

    const serverDomain = settings.serverDomain;
    const serverPort = settings.serverPort;
    const { user } = useParams();

    useEffect(() => {
        async function fetchSettings() {
            const response = await fetch(`${serverDomain}/user/${user}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const fetchedSettings = await response.json(response);
            setContent(fetchedSettings);
        }
        fetchSettings();
    }, [serverDomain, serverPort, user])

    return (
        <>
            <div className="container">
                <div className="col mx-auto" style={{ height: '600px', width: '600px'}}> 
                    <Card>
                        <Card.Img variant="top" src={content ? content.avatar : '/images/menu/carousel3.jpg'} style={{ height: '600px', width: '600px', display: 'block', marginLeft: 'auto', marginRight: 'auto', objectFit: 'cover', overflow: 'hidden' }} />
                        <Card.Body>
                            <Card.Title>@{content ? content.username : ''}</Card.Title>
                            <Card.Text>
                                {content ? content.description : ''}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    )
}

export default Account;
