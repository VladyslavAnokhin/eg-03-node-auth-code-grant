/**
 * @file
 * Example 31: Bulk sending
 * @author DocuSign
 */

const path = require('path')
    , fs = require('fs-extra')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../ds_configuration.js').config
    ;
    
const eg031BulkSending = exports
    , eg = 'eg031' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    , demoDocsPath = path.resolve(__dirname, '../../demo_documents')
    ;

/**
 * Create the envelope
 * @param {object} req Request obj 
 * @param {object} res Response obj
 */
eg031BulkSending.createController = async (req, res) => {
    // Step 1: Obtain your OAuth token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuthCodeGrant.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // We could store the parameters of the requested operation so it could be 
        // restarted automatically. But since it should be rare to have a token issue
        // here, we'll make the user re-enter the form data after authentication.
        req.dsAuthCodeGrant.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    let body = req.body
    // Additional data validation might also be appropriate
    , list1 = {
        signer: { 
            name: validator.escape(body.signerName1),
            email: validator.escape(body.signerEmail1),
        },
        cc: {
            name: validator.escape(body.ccName1),
            email: validator.escape(body.ccEmail1),
        }
    }
    , list2 = {
        signer: { 
            name: validator.escape(body.signerName2),
            email: validator.escape(body.signerEmail2),
        },
        cc: {
            name: validator.escape(body.ccName2),
            email: validator.escape(body.ccEmail2),
        }
    }

    args = {
        accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
    }

    // Step 2. Construct your API headers
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

    let groupApi = new docusign.GroupsApi(dsApiClient)
    
    try {
        { // Step 3. Create bulk list
            
        }

        results = await groupApi.updateGroups(args.accountId, {
            groupInformation: {
                groups:[
                    {
                        permissionProfileId: permissionProfileId,
                        groupId: userGroupId
                    }
                ]
            }
        })

        console.log(results)
    }
    catch (error) {
        let errorBody = error && error.response && error.response.body
            // we can pull the DocuSign error code and message from the response body
            , errorCode = errorBody && errorBody.errorCode
            , errorMessage = errorBody && errorBody.message
            ;
        // In production, may want to provide customized error messages and 
        // remediation advice to the user.
        res.render('pages/error', {err: error, errorCode: errorCode, errorMessage: errorMessage});
    }

    if (results) {
        res.render('pages/example_done', {
            title: "The permission set",
            h1: "The permission profile was successfully set to the user group",
            message: "The permission profile was successfully set to the user group!"
        });
    }
}

// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg031BulkSending.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {

        res.render('pages/examples/eg031BulkSending', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Bulk sending",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuthCodeGrant.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}