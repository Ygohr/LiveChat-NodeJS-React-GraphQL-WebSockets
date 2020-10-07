const { GraphQLServer, PubSub } = require('graphql-yoga')

const messages = []

const typeDefs = `
    type Message {
        id: ID!
        user: String!
        message: String!
    }

    type Query {
        messages: [Message!]
    }

    type Mutation {
        postMessage(user: String!, message: String!): ID!
    }

    type Subscription {
        messages: [Message!]
    }
`;

const subscribers = [];
const onMessageUpdate = (fn) => subscribers.push(fn);

const resolvers = { 
    Query: {
        messages: () => messages,
    },

    Mutation: {
        postMessage: (parent, {user, message}) => {
            const id = messages.length;
            messages.push({
                id,
                user,
                message
            });

            subscribers.forEach(fn => fn());

            return id;
        }
    },

    Subscription: {
        messages: {
            subscribe: (parent, args, { pubSub }) => {
                const channel = Math.random().toString(36).slice(2, 15);

                onMessageUpdate(() => pubSub.publish(channel, { messages }));

                setTimeout(() => pubSub.publish(channel, { messages }), 0);

                return pubSub.asyncIterator(channel);
            }
        }
    }
};

const pubSub = new PubSub();
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubSub } });
server.start(({port}) => {
    console.log(`Server on http://localhost:${port}/`) 
});