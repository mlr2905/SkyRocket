const bl = require('../bl/bl_role_airlines')
const logger = require('../logger/my_logger')

//role_airlines/users


exports.userAirlineBySearch = async (req, res) => {
    // const user_id = parseInt(req.params.id)
    const query = req.query
    const email = query.email
    const username = query.username
    const password = query.password
    const id = query.id
    let search = email ? email : username ? username : password ? password : id;
    let type = search !== undefined ? (search === email ? "email" : search === username ? "username" : search === password ? "password" : "id") : undefined;

    logger.info(`User search request by ${type}: ${search}`)
    logger.debug(`Search query parameters: ${JSON.stringify(query)}`)

    try {
        const user = await bl.get_by_id_user(type, search)
        if (user) {
            logger.info(`User found for ${type}: ${search}`)
            res.status(200).json(user)
        }
        else {
            logger.warn(`User not found for ${type}: ${search}`)
            res.status(404).json({ "error": `The id ${search} you specified does not exist in the system` })
        }
    } catch (error) {
        logger.error(`Error searching user by ${type}: ${search}`, error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

exports.userAirlineById = async (req, res) => {
    const user_id = parseInt(req.params.id)
    logger.info(`User details request for ID: ${user_id}`)

    try {
        const user = await bl.get_by_id_user('id', user_id)
        if (user) {
            if (user !== 'Postponed') {
                logger.info(`User details found for ID: ${user_id}`)
                res.status(200).json(user)
            }
            else {
                logger.warn(`Access denied for user ID: ${user_id}`)
                res.status(403).json({ "error": `Access denied, you do not have permission to access the requested Id ${user_id}` })
            }
        }
        else {
            logger.warn(`User not found for ID: ${user_id}`)
            res.status(404).json({ "error": `cannot find user with id '${user_id}'` })
        }
    }
    catch (error) {
        logger.error(`Error fetching user ID: ${user_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later '${error}'` })
    }
};

exports.createUserAirline = async (req, res) => {
    const new_user = req.body
    logger.info('Creating new user Airline')
    logger.debug(`New user data: ${JSON.stringify(new_user)}`)

    try {
        const result = await bl.create_user(new_user)
        if (result.ok) {
            logger.info(`User Airline created successfully: ${new_user.username || new_user.email}`)
            res.status(201).json(result.ok)
        }
        else if (result === 'rejected') {
            logger.warn(`User Airline creation rejected - duplicate user: ${new_user.username || new_user.email}`)
            res.status(409).json({ "error": `Username ${new_user.username} or email ${new_user.email} exist in the system` })
        }
        else {
            logger.error('User Airline creation failed with unknown error')
            res.status(503).json({ "error": `The request failed, try again later` })
        }
    } catch (error) {
        logger.error('Error creating user Airline:', error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

exports.updateUserAirline = async (req, res) => {
    const id = req.params.id
    logger.info(`Updating user Airline with ID: ${id}`)

    try {
        const user = await bl.get_by_id_user('id', id)
        if (user) {
            const updated = req.body
            logger.debug(`Update data for user ID ${id}: ${JSON.stringify(updated)}`)

            const result = await bl.update_user(id, updated)
            if (result) {
                logger.info(`User Airline ${id} updated successfully with email: ${updated.email}`)
                res.status(201).json(`email ${updated.email} successfully updated`)
            }
            else {
                logger.warn(`User Airline update failed - email already exists: ${updated.email}`)
                res.status(409).json({ "error": `${updated.email} already exists` })
            }
        }
        else {
            logger.warn(`User Airline update failed - user not found: ${id}`)
            res.status(404).json({ "error": `No user found with this handle '${id}'` })
        }
    }
    catch (error) {
        logger.error(`Error updating user Airline ${id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

exports.createAirline = async (req, res) => {
    const new_airline = req.body
    logger.info('Creating new airline')
    logger.debug(`New airline data: ${JSON.stringify(new_airline)}`)

    try {
        const result = await bl.create_airline(new_airline)
        if (result.id) {
            logger.info(`Airline created successfully with ID: ${result.id}`)
            res.status(201).json(result)
        }
        else if (result === 'rejected') {
            logger.warn(`Airline creation rejected - duplicate name or user_id: ${new_airline.name}`)
            res.status(409).json({ "error": `name ${new_airline.name} or user_id ${new_airline.user_id} exist in the system` })
        }
        else {
            logger.error('Airline creation failed with unknown error')
            res.status(503).json({ "error": `The request failed, try again later ${result}` })
        }
    } catch (error) {
        logger.error('Error creating airline:', error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

exports.airlineById = async (req, res) => {
    const airline_id = parseInt(req.params.id)
    logger.info(`Airline details request for ID: ${airline_id}`)

    try {
        const airline = await bl.get_by_id_airline(airline_id)
        if (airline) {
            logger.info(`Airline details found for ID: ${airline_id}`)
            res.status(200).json(airline)
        }
        else {
            logger.warn(`Airline not found for ID: ${airline_id}`)
            res.status(404).json({ "error": `The id ${airline_id} you specified does not exist in the system` })
        }
    } catch (error) {
        logger.error(`Error fetching airline ID: ${airline_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

exports.updateAirline = async (req, res) => {
    const airline_id = parseInt(req.params.id)
    logger.info(`Updating airline with ID: ${airline_id}`)

    try {
        const airline = await bl.get_by_id_airline(airline_id)
        if (airline) {
            const updated_airline_req = req.body
            logger.debug(`Update data for airline ID ${airline_id}: ${JSON.stringify(updated_airline_req)}`)

            const result = await bl.update_airline(airline_id, updated_airline_req)
            logger.info(`Airline ${airline_id} updated successfully`)
            res.status(201).json(result)
        }
        else {
            logger.warn(`Airline update failed - airline not found: ${airline_id}`)
            res.status(404).json({ "error": `The id ${airline_id} you specified does not exist in the system` })
        }
    }
    catch (error) {
        logger.error(`Error updating airline ${airline_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

exports.flightByAirline_id = async (req, res) => {
    const airline_id = parseInt(req.params.id)
    logger.info(`Retrieving flights by airline ID: ${airline_id}`)

    try {
        const flights = await bl.get_flight_by_airline_id(airline_id)
        if (flights) {
            logger.info(`Flights found for airline ID: ${airline_id}`)
            logger.debug(`Retrieved ${flights.length} flights for airline ${airline_id}`)
            res.status(200).json(flights)
        }
        else {
            logger.warn(`No flights found for airline ID: ${airline_id}`)
            res.status(404).json({ "error": `cannot find flights for airline id ${airline_id}` })
        }
    }
    catch (error) {
        logger.error(`Error retrieving flights for airline ${airline_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

exports.flightById = async (req, res) => {
    const flight_id = parseInt(req.params.id)
    logger.info(`Flight details request for ID: ${flight_id}`)

    try {
        const flight = await bl.get_by_id_flights(flight_id)
        if (flight) {
            logger.info(`Flight details found for ID: ${flight_id}`)
            res.status(200).json(flight)
        }
        else {
            logger.warn(`Flight not found for ID: ${flight_id}`)
            res.status(404).json({ "error": `cannot find flight with id ${flight_id}` })
        }
    } catch (error) {
        logger.error(`Error fetching flight ID: ${flight_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

exports.createFlight = async (req, res) => {
    const new_flight = req.body
    logger.info('Creating new flight')
    logger.debug(`New flight data: ${JSON.stringify(new_flight)}`)

    try {
        const check_flight_existence = await bl.check_flight_existence(new_flight)
        logger.debug(`Flight existence check result: ${check_flight_existence}`)

        if (!check_flight_existence) {
            const result = await bl.create_new_flight(new_flight)
            if (result.id > 0) {
                logger.info(`Flight created successfully with ID: ${result.id}`)
                res.status(201).json(result)
            }
            else {
                const id = result.status === "airline_id" ? new_flight.airline_id :
                    result.status === "origin_country_id" ? new_flight.origin_country_id :
                        result.status === "destination_country_id" ? new_flight.destination_country_id :
                            result.status === "plane_id" ? new_flight.plane_id : null;

                logger.warn(`Flight creation failed - invalid ${result.status}: ${id}`)
                res.status(404).json({ "error": `The ${id} you specified does not exist in the ${result.status}` })
            }
        }
        else {
            logger.warn(`Flight creation failed - duplicate flight`)
            res.status(409).json({ "error": "The flight you want already exists" })
        }
    } catch (error) {
        logger.error('Error creating flight:', error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
};

exports.updateFlight = async (req, res) => {
    const flight_id = parseInt(req.params.id)
    logger.info(`Updating flight with ID: ${flight_id}`)

    try {
        const flight = await bl.get_by_id_flights(flight_id)
        const update_flight = req.body
        logger.debug(`Update data for flight ID ${flight_id}: ${JSON.stringify(update_flight)}`)

        let result = null
        if (flight) {
            result = await bl.update_flight(flight_id, update_flight)
            logger.debug(`Flight update result status: ${result.status}`)

            if (result.status === "OK") {
                logger.info(`Flight ${flight_id} updated successfully`)
                res.status(200).json({ id: flight_id, ...update_flight })
            }
            else if (result.status === "some") {
                logger.warn(`Flight update failed - invalid data: ${JSON.stringify(update_flight)}`)
                res.status(404).json({ "error": `The id ${update_flight} you specified does not exist in the ${result.status}` })
            }
            else if (["plane_id", "origin_country_id", "destination_country_id", "airline_id"].includes(result.status)) {
                let id = result.status === "plane_id" ? update_flight.plane_id :
                    result.status === "origin_country_id" ? update_flight.origin_country_id :
                        result.status === "destination_country_id" ? update_flight.destination_country_id :
                            result.status === "airline_id" ? update_flight.airline_id : null;

                logger.warn(`Flight update failed - invalid ${result.status}: ${id}`)
                res.status(404).json({ "error": `The id ${id} you specified does not exist in the ${result.status}` })
            }
            else if (result.status == "exists") {
                logger.warn(`Flight update failed - duplicate flight`)
                res.status(409).json({ "error": "The flight you want already exists" })
            }
        }
        else {
            logger.warn(`Flight update failed - flight not found: ${flight_id}`)
            res.status(404).json({ "error": `The id ${flight_id} you specified does not exist in the system` })
        }
    }
    catch (error) {
        logger.error(`Error updating flight ${flight_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later` })
    }
};

exports.deleteFlight = async (req, res) => {
    const flight_id = parseInt(req.params.id)
    logger.info(`Deleting flight with ID: ${flight_id}`)

    try {
        const flight = await bl.get_by_id_flights(flight_id)
        logger.debug(`Flight existence check for ID ${flight_id}: ${!!flight}`)

        if (flight) {
            const result = await bl.delete_flight(flight_id)
            logger.info(`Flight ${flight_id} deleted successfully`)
            res.status(204).json(`flight id: ${flight_id} deleted successfully`)
        }
        else {
            logger.warn(`Flight deletion failed - flight not found: ${flight_id}`)
            res.status(404).json({ "error": `The ID ${flight_id} you specified does not exist` })
        }
    }
    catch (error) {
        logger.error(`Error deleting flight ${flight_id}:`, error)
        res.status(503).json({ "error": `The request failed, try again later ${error}` })
    }
}