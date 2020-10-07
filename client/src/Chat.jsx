import React from 'react';
import Header from './Header'

import { 
    ApolloClient, 
    InMemoryCache, 
    ApolloProvider, 
    useSubscription, 
    useMutation,
    gql
} from '@apollo/client';

import { WebSocketLink } from '@apollo/client/link/ws';

import {
    Container,
    Row,
    Col,
    FormInput,
    Button
} from "shards-react";

const link = new WebSocketLink({
    uri: `ws://localhost:4000/`,
    options: {
      reconnect: true
    }
  });

const client = new ApolloClient({
    link,
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache()
});

const GET_MESSAGES = gql`
    subscription {
        messages {
            id
            message
            user
        }
    }
`;

const POST_MESSAGE = gql`
    mutation ($user: String!, $message: String!) {
        postMessage(user:$user, message:$message)
    }
`;

const Messages = ({ user }) => {
    const { data } = useSubscription(GET_MESSAGES);


    if (!data || user === '') {
        
        return (
            <Header />
        );
    }
    
    return (
    <> 
        <Header />
        {data.messages.map(({ id, user: messageUser, message }) => (

            <div key={id} 
                style={{
                    display: 'flex',
                    justifyContent: user === messageUser ? 'flex-end' : 'flex-start',
                    paddingBottom: "1em",
                    marginTop: "2em"                    
                }} 
            >
                {user !== messageUser && (
                    <div
                        style={{
                          height: 55,
                          width: 55,
                          marginRight: ".5em",
                          border: "2px solid #e5e6ea",
                          borderRadius: 25,
                          textAlign: "center",
                          fontSize: "10pt",
                          paddingTop: 15
                        }}>
                        {messageUser.toUpperCase()}
                    </div>
                )}

                <div key={id} 
                    style={{
                        background: user === messageUser ? "#58bf56" : "#e5e6ea",
                        color: user === messageUser ? "#ffffff" : "#000000",
                        padding: "1em",
                        borderRadius: "1em",
                        maxWidth: "60%"
                    }}>
                    {message}
                </div>
                {user === messageUser && (
                    <div
                        style={{
                          height: 55,
                          width: 55,
                          marginLeft: ".5em",
                          border: "2px solid #e5e6ea",
                          borderRadius: 25,
                          textAlign: "center",
                          fontSize: "10pt",
                          paddingTop: 15
                        }}>
                        Eu
                    </div>
                )} 
            </div>

        ))}
    </>)
};

const Chat = () => {

    const [ state, stateSet ] = React.useState({
        user: localStorage.getItem('username'),
        message: ''
    });

    const [ postMessage ] = useMutation(POST_MESSAGE);

    const onChangeUser = (e) => {
        localStorage.setItem('username', e.target.value);
        stateSet({
            ...state,
            user: e.target.value
        });
    }

    const onLogoffUser = () => {
        localStorage.setItem('username', '');
        client.resetStore();
        
        stateSet({
            ...state,
            user: ''
        });

        console.log(state)
    }

    const onSend = () => {
        if (state.user && state.message.length > 0) {
            postMessage({
                variables: state
            })
        }
        stateSet({
            ... state,
            message: ''
        })
    }

    return (
        <Container>
            <Messages user={state.user} />
            <Row >
                <Col xs={2} style={{ padding: 0 }}>                    
                    <FormInput
                        label="User"
                        placeholder="Digite seu nickname"
                        value={state.user}
                        onChange={(e) => onChangeUser(e)}
                    />
                </Col>

                <Col xs={6}>                    
                    <FormInput
                        label="Message"
                        placeholder="Digite sua mensagem..."
                        value={state.message}
                        onChange={(e) => stateSet({
                            ... state,
                            message: e.target.value
                        })}
                        onKeyUp={(e) => {
                            if (e.keyCode === 13) {
                                onSend();
                            }
                        }}
                    />
                </Col>

                <Col 
                    xs={4} 
                    style={{ padding: 0 }}>
                    <Button 
                        onClick={() => onSend()}>
                        Enviar
                    </Button>
                    <Button 
                        onClick={() => onLogoffUser()} 
                        style={{
                            marginLeft: 5,
                            backgroundColor: "#c92626",
                            border: 0
                        }}>
                        Logoff
                    </Button>

                </Col>
            </Row>
        </Container>
    )
};

export default () => (
    <ApolloProvider client={client}>
        <Chat />
    </ApolloProvider>
);