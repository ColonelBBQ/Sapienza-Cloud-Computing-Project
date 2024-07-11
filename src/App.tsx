import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from '@aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import outputs from "../amplify_outputs.json";
import NewSession from './pages/NewSession';
import { format } from 'date-fns';

Amplify.configure(outputs);

const client = generateClient<Schema>({});

function Home() {
  const [sessions, setSessions] = useState<Array<Schema["Sessions"]["type"]>>([]);
  const [recentSessions, setRecentSessions] = useState<Array<Schema["Sessions"]["type"]>>([]);
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    client.models.Sessions.observeQuery().subscribe({
      next: (data) => setSessions([...data.items]),
    });

    fetchUserAttributes().then(attributes => {
      setUserName(attributes.given_name || attributes.givenName || "User");
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setRecentSessions(sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6));
  }, [sessions]);
  
  return (
    <Authenticator signUpAttributes={['given_name', "email"]} socialProviders={['apple', 'google']}>
      {({ signOut }) => (
        <div className='app-container'>
          <nav className='nav-bar'>
            <a className="navbar-brand" href="/">
             <img className='logo-img' src="src/assets/logo.png" alt="" />
             meditdiary
            </a>
            <div className='nav-container'>
              <button className="button-sign-out" onClick={signOut}>Sign out</button>
            </div>
          </nav>

          <h1 className='main-title'>Hi {userName}! Welcome to Your Meditation Diary!</h1>
          <div className='container-sessions-with-title'>
            <h2>Here are Your Recent Activities:</h2>
            <ul>
              {recentSessions.map((recentSessions) => (
                <li key={recentSessions.id}>
                  <div className='container-sessions'>
                    <div className='session'>
                      <div>Date: {format(new Date(recentSessions.createdAt), 'yyyy-MM-dd')}, Volume: {recentSessions.score_volume}, Rating: {recentSessions.score_rating}</div>
                      <div>Session Description: {recentSessions.content}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button className='button-start-main' onClick={() => navigate('/new-session')}>Start New Session!</button>
          </div>
          <div>
          
          </div>
        </div>
      )}
    </Authenticator>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-session" element={<NewSession client={client}/>} />
      </Routes>
    </Router>
  );
}

export default App;
