import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
export const resolvers = {
    Query: {
        books: () => books,
    },

    Mutation: {
        createPost(parent, args, { postController }) {
            pubsub.publish('POST_CREATED', { postCreated: args });
            return args;
        },
    },

    Subscription: {
        postCreated: {
            subscribe: () => pubsub.asyncIterator(['POST_CREATED']),
        },
    },
};


const books = [
    {
        title: 'The Awakening',
        author: 'Kate Chopin',
    },
    {
        title: 'City of Glass',
        author: 'Paul Auster',
    },
];
