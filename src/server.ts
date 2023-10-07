import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import i18n from '~/config/i18n.config'
import { env } from '~/config/environment.config'
import { logger } from '~/config/logger.config'
import { AppDataSource } from './config/database.config'
import { apiV1 } from './routes/v1'
import { client } from '~/config/redis.config'

// connection database
AppDataSource.initialize()
    .then(() => {
        logger.info('Connection database has been established successfully.')
    })
    .then(() =>
        client
            .connect()
            .then(() => {
                logger.info('Connection redis has been established successfully.')
            })
            .then(() => main())
            .catch((error) => logger.error('Unable to connect to the reids:', error))
    )
    .catch((error) => logger.error('Unable to connect to the database:', error))

// main server
const main = () => {
    const app = express()

    /////middleware
    app.use(cors())
    app.use(express.urlencoded({ extended: true }))
    // Enable req.body data
    app.use(express.json())
    // log cac request
    app.use(morgan('dev'))
    app.use(i18n.init)

    // use APIs v1
    app.use('/api', apiV1)

    // start server listening
    const port = env.APP_PORT || 5000

    app.listen(port, () => {
        logger.info(`Express is listen at port ${port}`)
    })
}
