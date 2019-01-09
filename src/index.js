const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const faker = require('faker')

const resolvers = {
  Query: {
    info() {
      return {
        name: 'Demo Wrapper',
        version: '0.0.1'
      }
    },
    getTopCitiesByEvent(parent, { capital }, info, context) {
      return [
        {
          name: 'Seattle'
        },
        {
          name: 'London'
        },
        {
          name: 'New York'
        }
      ]
    },
    getTopCitiesByCost(parent, { capital }, info, context) {
      return [
        {
          name: 'Seattle'
        },
        {
          name: 'Los Angeles'
        },
        {
          name: 'San Fransico'
        }
      ]
    },

    idealCityFromCitiesByEventAndCost(
      parent,
      { citiesByEvent, citiesByCost },
      info,
      context
    ) {
      return {
        name: 'Seattle'
      }
    },
    capitalToIdealLaunchDate(parent, { Capital }, info, context) {
      return '01/10/2019'
    },
    capitalToRequiredInventory(parent, { Capital }, info, context) {
      return [
        {
          name: 'Pastrami'
        }
      ]
    },
    generateLaunchStrategy(
      parent,
      { idealCity, idealLaunchDate, requiredInventory },
      info,
      context
    ) {
      return {
        idealCity,
        idealLaunchDate,
        requiredInventory
      }
    }
  },
  Mutation: {
    info() {
      return {
        name: 'Demo wrapper',
        version: '0.0.1'
      }
    }
  }
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql', // the auto-generated GraphQL schema of the Prisma API
      endpoint: 'https://maana-incubator.herokuapp.com/training-demo/dev', // the endpoint of the Prisma API
      debug: true // log all GraphQL queries & mutations sent to the Prisma API
      // secret: 'mysecret123', // only needed if specified in `database/prisma.yml`
    })
  })
})

server.start(() => console.log('Server is running on http://localhost:4000'))
