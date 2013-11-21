module.exports.Krang = (->

  "use strict"
  topics = {}
  lastUid = -1

  _publish = (topic, data) ->
    return false  unless topics.hasOwnProperty(topic)
    notify = ->
      subscribers = topics[topic]
      throwException = (e) ->
        ->
          throw e
      i = 0
      j = subscribers.length
      while i < j
        try
          if subscribers[i].ref?
            subscribers[i].func.call subscribers[i].ref, topic, data
          else
            subscribers[i].func topic, data
        catch e
          setTimeout throwException(e), 0
        i++
    setTimeout notify, 0
    true

  publish = (topic, data) ->
    _publish topic, data, false

  subscribe = (topic, func, ref) ->
    # topic is not registered yet
    topics[topic] = []  unless topics.hasOwnProperty(topic)
    token = (++lastUid).toString()
    topics[topic].push
      token: token
      func: func
      ref: ref
    token

  unsubscribe = (token) ->
    for m of topics
      if topics.hasOwnProperty(m)
        i = 0
        j = topics[m].length

        while i < j
          if topics[m][i].token is token
            topics[m].splice i, 1
            return token
          i++
    false

  publish: publish
  subscribe: subscribe
  unsubscribe: unsubscribe
)()