import { FastifyReply, FastifyRequest } from 'fastify'
import jwt from 'jsonwebtoken'
import { PoeStackUser } from '../types/poeStackuser'

function getJwtFromAuthHeader(header?: string) {
  if (!header) {
    return
  }
  const authValue = header.split(' ')
  if (authValue.length < 2 || authValue[0] !== 'Bearer') {
    return
  }
  return authValue[1]
}

export async function identifyUser(request: FastifyRequest) {
  const rawJwt = getJwtFromAuthHeader(request.headers.authorization)
  if (!rawJwt) {
    return
  }
  const userInfo = jwt.decode(rawJwt)
  if (!userInfo) {
    return
  }
  request.poeStackUser = userInfo as PoeStackUser
}
