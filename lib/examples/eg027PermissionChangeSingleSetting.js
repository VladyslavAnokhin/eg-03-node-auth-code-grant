/**
 * @file
 * Example 027: Updateing individual permission profile settings
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../ds_configuration.js').config
    ;
    
const eg027UpdatePermissionProfile = exports
    , eg = 'eg027' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;

/**
 * Create the envelope
 * @param {object} req Request obj 
 * @param {object} res Response obj
 */
eg027UpdatePermissionProfile.createController = async (req, res) => {

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
        // , allowApiAccess = validator.escape(body.allowApiAccess)

    args = {
        accessToken: req.user.accessToken,  // represents your {ACCESS_TOKEN}
        basePath: req.session.basePath,
        accountId: req.session.accountId,   // represents your {ACCOUNT_ID}
        selectedId: validator.escape(body.profileId),
        profileName: validator.escape(body.profileName)
    }
      , results = null
      ;

    // Step 2. Construct your API headers
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    
    let accountsApi = new docusign.AccountsApi(dsApiClient);
    let selectedPermission = await accountsApi.getPermissionProfile(args.accountId, args.selectedId)

    // Step 3: updates the template.
    try {
        results = await accountsApi.updatePermissionProfile(args.accountId, args.selectedId,
             { 
                permissionProfile: {
                    permissionProfileName: args.profileName
                }
        })
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
            title: "Permission updated",
            h1: "Permission updated",
            message: `The Permission has been updated.`
        });
    }
}

// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg027UpdatePermissionProfile.getController = async (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {

        let dsApiClient = new docusign.ApiClient();
        dsApiClient.setBasePath(req.session.basePath);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + req.user.accessToken);

        let accountApi = new docusign.AccountsApi(dsApiClient)
        let profiles = await accountApi.listPermissions(req.session.accountId)


        res.render('pages/examples/eg027PermissionChangeSingleSetting', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Updateing individual permission profile settings",
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation,
            profiles: profiles.permissionProfiles
        });
    } else {
        // Save the current operation so it will be resumed after authentication
        req.dsAuthCodeGrant.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }
}
