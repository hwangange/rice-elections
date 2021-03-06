"""
Utility functions for webapp2.
"""
import logging

__author__ = 'Waseem Ahmad <waseem@rice.edu>'

import datetime
import os
import jinja2
import json

from authentication.gaesessions import get_current_session

MAIN_DIR = os.path.dirname(__file__)
PAGES_DIR = os.path.join(MAIN_DIR, '../views')

JINJA_ENV = jinja2.Environment(
    loader=jinja2.FileSystemLoader(PAGES_DIR))

NAV_BAR = [
    {'text': 'Home', 'link': '/home'},
    {'text': 'Vote', 'link': '/vote'},
    {'text': 'Admin', 'link': '/admin/organization'},
    {'text': 'Contact', 'link': '/contact'}]

def render_page_content(handler, page_name, page_content):
    # Mark all links in the nav bar as inactive except the page open
    for item in NAV_BAR:
        item['active'] = page_name.startswith(item['link'])

    template = JINJA_ENV.get_template('templates/page.html')
    template_vals = {'nav_bar': NAV_BAR,
                     'page_content': page_content}

    # If logged in, display NetID with logout option
    session = get_current_session()
    if session.has_key('net_id'):
        template_vals['net_id'] = session['net_id']
    
    handler.response.out.write(template.render(template_vals))


def render_page(handler, page_name, page_data):
    page = get_page(page_name, page_data)

    # Mark all links in the nav bar as inactive except the page open
    for item in NAV_BAR:
        item['active'] = (item['link'] == page_name)

    template = JINJA_ENV.get_template('templates/page.html')
    template_vals = {'nav_bar': NAV_BAR,
                     'page_content': page}
    
    # If logged in, display NetID with logout option
    session = get_current_session()
    if session.has_key('net_id'):
        template_vals['net_id'] = session['net_id']
    
    handler.response.out.write(template.render(template_vals))


def render_html(handler, page_name, page_data):
    handler.response.out.write(get_page(page_name, page_data))


def get_page(page_name, page_data):
    # Add Jinja Filters
    JINJA_ENV.filters['datetime'] = format_datetime
    JINJA_ENV.globals['now'] = str(datetime.datetime.now())

    # Get the page name being requested assume home.html if none specified
    if page_name == '/':
        page_name += NAV_BAR[0]['link']
    
    # Get page info
    try:
        if page_data:
            page = JINJA_ENV.get_template(page_name + '.html').render(page_data)
        else:
            page = JINJA_ENV.get_template(page_name + '.html').render()
    except jinja2.TemplateNotFound:
        page = JINJA_ENV.get_template('templates/not-found.html').render()

    return page


def format_datetime(value, format):
    if format == 'medium':
        return value.strftime('%a, %B %d, %Y, %I:%M %p') + ' UTC'
    if format == 'small':
        return value.strftime('%m/%d/%y %I:%M %p') + ' UTC'


def respond(handler, status, message):
    """
    Sends a response to the front-end. Used for AJAX responses.
    
    Args:
    	handler {webapp2.RequestHandler}: request handler
        status {String}: response status
        message {String}: response message
    """
    handler.response.write(json.dumps({'status': status, 'msg': message}))