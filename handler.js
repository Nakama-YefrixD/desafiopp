'use strict';
const querystring = require("querystring")
const dotenv = require('dotenv');
dotenv.config();
const mysql = require('serverless-mysql')({
  config: {
    host     : process.env.ENDPOINT,
    database : process.env.DATABASE,
    user     : process.env.USERNAME,
    password : process.env.PASSWORD
  }
})

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
};

module.exports.helloUser = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Hola ! helloUser ${process.env.ENDPOINT}`,
        input: event,
      },
      null,
      2
    ),
  };
};

module.exports.listaMensajesActivos = async (event) => {

  try {
    
    const body = querystring.parse(event["body"])

    const { mes, idCliente } = body;

    if(!mes){
      return {
        statusCode: 400,
        body: JSON.stringify(
          {
            error: 'El mes es obligatorio.'
          },
          null,
          2
        ),
      };
    }

    const results = await mysql.query(
      'SELECT estadoEnvio, COUNT(*) as cantidad_mensajes ' +
      'FROM mensaje m ' +
      'JOIN campania c ON m.idCampania = c.idCampania ' +
      'JOIN usuario u ON u.idUsuario = c.idUsuario ' +
      'JOIN cliente c ON c.idCliente = u.idCliente ' +
      'WHERE MONTH(c.fechaHoraProgramacion) = ? ' +
      'AND (m.idCliente = ? OR ? IS NULL) ' +
      'AND m.estado = TRUE ' +
      'GROUP BY estadoEnvio',
      [mes, idCliente, idCliente]
    );

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: `Mostrar lista de mensajes activos`,
          input: results,
        },
        null,
        2
      ),
    };
    
  } catch (error) {
    
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          error: 'Error interno del servidor.'
        },
        null,
        2
      ),
    };
  } finally {
    await mysql.end();
  }
};

module.exports.programarCampania = async (event) => {

  try {
    
    const body = querystring.parse(event["body"])

    const { nombre, idUsuario, fechaHoraProgramacion } = body;

    const result = await mysql.query(
      'INSERT INTO campania (nombre, idUsuario, fechaHoraProgramacion, estado) VALUES (?, ?, ?, TRUE)',
      [nombre, idUsuario, fechaHoraProgramacion]
    );

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: `La campaña fue creada correctamente`,
          input: result,
        },
        null,
        2
      ),
    };
    
  } catch (error) {
    
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          error: 'Error interno del servidor.'
        },
        null,
        2
      ),
    };
  } finally {
    await mysql.end();
  }
};