/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-31 15:00:04
 * @LastEditTime: 2021-10-08 01:23:08
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { DatabaseAgent } from '../../lib/db-agent'
import { permissions } from '../../constants/permissions'
import { getAccountByUsername, getRoles, isValidAccountId, isValidRoleNames } from '../../api/account'
import { array2map, mergeMap2ArrayByKey } from '../../utils/array'
import { ObjectId } from 'mongodb'

const { APPLICATION_UPDATE } = permissions

/**
 * The handler of getting collaborators of an application
 */
export async function handleGetCollaborators(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()


  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('invalid appid')

  if (!app.collaborators?.length) {
    return res.send({ data: [] })
  }

  const db = DatabaseAgent.db
  const co_ids = app.collaborators.map(co => co.uid)
  const docs = await db.collection(Constants.cn.accounts)
    .find({
      _id: {
        $in: co_ids.map(id => new ObjectId(id))
      }
    }, {
      projection: { '_id': 1, 'username': 1, 'name': 1 }
    })
    .toArray()

  // merge app
  const user_map = array2map(docs, '_id', true)
  const ret = mergeMap2ArrayByKey(user_map, app.collaborators, 'uid', 'user')
  return res.send({
    data: ret
  })
}

/**
 * The handler of inviting collaborator
 */
export async function handleInviteCollaborator(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const db = DatabaseAgent.db
  const { member_id, roles } = req.body

  if (!isValidRoleNames(roles))
    return res.status(422).send('invalid roles')

  if (!isValidAccountId(member_id))
    return res.status(422).send('invalid member_id')

  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app) {
    return res.status(422).send('app not found')
  }

  // check permission
  const code = await checkPermission(uid, APPLICATION_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  // reject if collaborator exists
  const exists = app.collaborators.filter(it => it.uid === member_id)
  if (exists.length) {
    return res.status(422).send('collaborator already exists')
  }

  // reject if the application owner get here
  if (app.created_by === member_id) {
    return res.status(422).send('collaborator is already the owner of this application')
  }

  // add a collaborator
  const collaborator = {
    uid: member_id,
    roles,
    created_at: Date.now()
  }
  const ret = await db.collection(Constants.cn.applications)
    .updateOne({
      appid: app.appid
    }, {
      $addToSet: {
        collaborators: collaborator
      }
    })

  return res.send({
    data: ret
  })
}

/**
 * The handler of searching collaborator
 */
export async function handleSearchCollaborator(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const username = req.body?.username
  if (!username) return res.status(422).send('username cannot be empty')

  const account = await getAccountByUsername(username)
  if (!account) {
    return res.send({ data: null })
  }

  return res.send({
    data: {
      _id: account._id,
      username: account.username,
      name: account.name
    }
  })
}

/**
 * The handler of getting roles
 */
export async function handleGetRoles(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const roles = getRoles()
  const rets = Object.keys(roles)
    // .filter(key => key !== roles.owner.name)
    .map(key => roles[key])

  return res.send({
    data: rets
  })
}

/**
 * The handler of removing collaborator of an application
 */
export async function handleRemoveCollaborator(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('invalid appid')

  // check permission
  const code = await checkPermission(uid, APPLICATION_UPDATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  // check collaborator_id
  const collaborator_id = req.params.collaborator_id
  const [found] = app.collaborators.filter(co => co.uid === collaborator_id)
  if (!found) {
    return res.status(422).send('invalid collaborator_id')
  }

  const db = DatabaseAgent.db
  const r = await db.collection(Constants.cn.applications)
    .updateOne({ appid }, {
      $pull: {
        collaborators: { uid: collaborator_id }
      }
    })

  return res.send({
    data: r
  })
}