var Contra;

Contra = Contra || {};

Contra.Krang = (function() {
  "use strict";
  var lastUid, publish, subscribe, topics, unsubscribe, _publish;

  topics = {};
  lastUid = -1;
  _publish = function(topic, data) {
    var notify;

    if (!topics.hasOwnProperty(topic)) {
      return false;
    }
    notify = function() {
      var e, i, j, subscribers, throwException, _results;

      subscribers = topics[topic];
      throwException = function(e) {
        return function() {
          throw e;
        };
      };
      i = 0;
      j = subscribers.length;
      _results = [];
      while (i < j) {
        try {
          if (subscribers[i].ref != null) {
            subscribers[i].func.call(subscribers[i].ref, topic, data);
          } else {
            subscribers[i].func(topic, data);
          }
        } catch (_error) {
          e = _error;
          setTimeout(throwException(e), 0);
        }
        _results.push(i++);
      }
      return _results;
    };
    setTimeout(notify, 0);
    return true;
  };
  publish = function(topic, data) {
    return _publish(topic, data, false);
  };
  subscribe = function(topic, func, ref) {
    var token;

    if (!topics.hasOwnProperty(topic)) {
      topics[topic] = [];
    }
    token = (++lastUid).toString();
    topics[topic].push({
      token: token,
      func: func,
      ref: ref
    });
    return token;
  };
  unsubscribe = function(token) {
    var i, j, m;

    for (m in topics) {
      if (topics.hasOwnProperty(m)) {
        i = 0;
        j = topics[m].length;
        while (i < j) {
          if (topics[m][i].token === token) {
            topics[m].splice(i, 1);
            return token;
          }
          i++;
        }
      }
    }
    return false;
  };
  return {
    publish: publish,
    subscribe: subscribe,
    unsubscribe: unsubscribe
  };
})();