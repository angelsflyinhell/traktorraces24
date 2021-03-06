import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';

const settings = require('../api/settings.json');

async function createAccount() {
    const username = document.getElementById('input-username').value;
    const email = document.getElementById('input-email').value;
    const password = document.getElementById('input-password').value;
    const passwordAlt = document.getElementById('input-password-alt').value;

    if (password !== passwordAlt) {
        alert('Passwoerter stimmen nicht ueberein.')
        return;
    }

    if (username.includes(' ')) {
        alert('Nutzername darf keine leerzeichen enthalten.')
        return;
    }

    if (!username.match("^[A-Za-z0-9]")) {
        alert('Nutzername darf nur Zahlen und Buchstaben enthalten.')
        return;
    }

    if(!validateEmail(email)) {
        alert('Email ist nicht gueltig.')
        return;
    }

    const rawResponse = await fetch(`${settings.serverDomain}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "username": username,
            "email": email,
            "password": password
        })
    });
    const content = await rawResponse.json();

    if (content.success) {
        alert('Sie haben ihr Konto erfolgreich registriert!')
        window.location.replace(`${settings.siteDomain}/login`);
    } else {
        if (content.message === 'already registered')
            alert('Diese Anmeldedaten werden bereits verwendet.')
        else if (content.message === 'credentials cannot be empty')
            alert('Felder duerfen nicht leer bleiben')
    }
}

function Register() {
    const handleSubmit = (e) => {
        e.preventDefault();
        createAccount();
    };

    return (
        <div className="col-lg-4 mx-auto">
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                    <Form.Label>Nutzername</Form.Label>
                    <Form.Control type="username" placeholder="joeMama69" id="input-username"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>E-Mail Adresse</Form.Label>
                    <Form.Control type="email" placeholder="joe@example.com" id="input-email"/>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Passwort eingeben</Form.Label>
                    <Form.Control type="password" placeholder="Passwort" id="input-password"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Passwort erneut eingeben</Form.Label>
                    <Form.Control type="password" placeholder="Passwort" id="input-password-alt"/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                </Form.Group>
                <Button variant="primary" type="submit">Register</Button>
            </Form>
        </div>
    )
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export default Register;
