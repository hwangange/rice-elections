"""
Back end for election panel information.
"""

__author__ = 'Waseem Ahmad <waseem@rice.edu>'

import webapp2

from authentication import auth
from models import models, webapputils
from models.admin_.organization_panel_.election_panel import get_panel

PAGE_NAME = '/admin/organization-panel/election-panel/information'

class ElectionInformationHandler(webapp2.RequestHandler):

    def get(self):
        # Authenticate user
        voter = auth.get_voter(self)
        status = models.get_admin_status(voter)
        if not status:
            webapputils.render_page(self, '/templates/message', 
                {'status': 'Not Authorized', 'msg': MSG_NOT_AUTHORIZED})
            return
        
        data = {}

        # Get election
        election = auth.get_election()
        if election:
            data = {'id': str(election.key()),
                    'election': election.to_json()}
        panel = get_panel(PAGE_NAME, data, data.get('id'))
        render_page_content(self, PAGE_NAME, panel)

    def post(self):
        # Authenticate user
        org = auth.get_organization()
        if not org:
            None