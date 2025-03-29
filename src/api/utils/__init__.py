# api/utils/__init__.py

from flask import jsonify, url_for

class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)

def generate_sitemap(app):
    """ Return a JSON list of routes for dev mode """
    links = []
    for rule in app.url_map.iter_rules():
        if "GET" in rule.methods:
            try:
                url = url_for(rule.endpoint, **(rule.defaults or {}))
                if "/admin/" not in url:
                    links.append({
                        "methods": list(rule.methods),
                        "url": url,
                        "endpoint": rule.endpoint
                    })
            except:
                continue
    return jsonify(links)

    
