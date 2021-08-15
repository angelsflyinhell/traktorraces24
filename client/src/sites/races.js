import Header from "../components/navbar";
import { useEffect, useState } from "react";
import NavDropdown from 'react-bootstrap/NavDropdown';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
const settings = require('../api/settings.json');
var id;

function Races() {

    const username = localStorage.getItem('username') || '';

    const listOfMatches = [];

    const [content, setContent] = useState(undefined);

    const serverDomain = settings.serverDomain;
    const serverPort = settings.serverPort;

    useEffect(() => {
        async function fetchSettings() {
            const response = await fetch(`${serverDomain}:${serverPort}/matches`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const fetchedSettings = await response.json(response);
            setContent(fetchedSettings);
        }
        fetchSettings();
    }, [serverDomain, serverPort])


    const [auth, setAuth] = useState(undefined);

    useEffect(() => {
        async function fetchSettings() {
            const response = await fetch(`${serverDomain}:${serverPort}/confirmIdentity?sessionToken=${localStorage.getItem('sessionToken')}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const fetchedSettings = await response.json(response);
            setAuth(fetchedSettings);
        }
        fetchSettings();
    }, [serverDomain, serverPort])

    for (let i = 0; i < (content ? content.length : 0); i++) {

        
        id = content ? content[i].id : '';

        const startMatch = [];
        if ((auth ? auth.success : false) && auth.username === content[i].owner)
            startMatch.push(<Button variant="primary" onClick={() => {launchMatch(content[i].id)}}>Starten</Button>)

        const participators = [];
        for (let x = 0; x < (content ? content[i].players.length : 0); x++) {
            participators.push(
                <><b>{content[i].players[x]}</b><br></br></>
            )
        }


        listOfMatches.push(
            <Card>
                <Card.Body>
                    <Card.Title><h2>{content ? content[i].name : ''}</h2></Card.Title>
                    <Card.Text>
                        {content ? content[i].description : ''}
                        <br></br>
                        <NavDropdown.Divider />
                        Preisgeld: <b>${content ? content[i].price : ''}</b><br></br>
                        Veranstalter: <b>{content ? content[i].owner : ''}</b><br></br>
                        <NavDropdown.Divider />
                        <h5>Teilnehmer</h5>
                        {participators}
                    </Card.Text>
                    {startMatch}
                </Card.Body>
                <Button variant="primary" onClick={joinMatch}>Teilnehmen</Button>
            </Card>
        )
    }

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Header username={username}></Header>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Wettbewerb anmelden</Modal.Title>
                </Modal.Header>
                <Modal.Body>Bitte fuelle die folgenden Informationen aus, um einen Wettbewerb anzumelden!
                    <NavDropdown.Divider />
                    <Form.Control type="text" placeholder="Name" id="match-name" /><br></br>
                    <Form.Control type="text" placeholder="Beschreibung" id="match-desc" /><br></br>
                    <Form.Control type="text" placeholder="Preisgeld (nur Zahlen)" id="match-creds" /><br></br>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Abbrechen
                    </Button>
                    <Button variant="primary" onClick={createMatch}>
                        Anmelden
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="container">
                <div className="col-md mx-auto">
                    <h2>Aktuelle Wettbewerbe</h2>
                    <p>Hier koennen sie eine vollstaendige Liste aller aktuellen Wettbewerbe einsehen. Um einem Wettbewerb beizutreten, melden Sie sich bitte an und druecken sie danach auf <b>Teilnehmen</b></p>
                    <Button variant="success" onClick={handleShow}>Wettbewerb anmelden</Button>
                    <NavDropdown.Divider />
                    {listOfMatches}
                </div>
            </div>
        </>
    )
}

function createMatch() {
    (async () => {

        const price = document.getElementById('match-creds').value;
        const isValid = /^\d+$/.test(price);
        if (!isValid) {
            alert('Guthaben darf nur Zahlen enthalten');
            return;
        }

        fetch(`${settings.serverDomain}:${settings.serverPort}/matches/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "owner": localStorage.getItem('username'),
                "name": document.getElementById('match-name').value,
                "description": document.getElementById('match-desc').value,
                "sessionToken": localStorage.getItem('sessionToken').toString(),
                "price": `${price}`,
                "privacy": "false"
            })
        });
        alert('Wettbewerb wurde eingestellt!')
        window.location.replace(`${settings.siteDomain}/races`);

    })();
}

function joinMatch() {
    (async () => {
        const rawResponse = await fetch(`${settings.serverDomain}:${settings.serverPort}/match/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "matchId": id,
                "sessionToken": localStorage.getItem('sessionToken').toString()
            })
        });
        const content = await rawResponse.json();

        if (content.success) {
            alert('Sie wurden erfolgreich eingetragen!')
            window.location.replace(`${settings.siteDomain}/traktorraces24/races`);
        } else {
            alert('Du bist bereits eingetragen.')
        }
    })();
}

function launchMatch(matchId) {
    (async () => {
        const rawResponse = await fetch(`${settings.serverDomain}:${settings.serverPort}/match/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "matchId": matchId,
                "sessionToken": localStorage.getItem('sessionToken').toString()
            })
        });
        const content = await rawResponse.json();

        console.log(content)

        if (content.success) {
            alert('Der Wettbewerb wurde erfolgreich beendet!')
            window.location.replace(`${settings.siteDomain}/traktorraces24/races`);
        } else {
            alert('Irgendetwas ist schiefgelaufen. Bitte versuche es spaeter erneut.')
        }
    })();
}

export default Races;