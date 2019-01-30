/**
 * @file
 * Example 009: Send envelope using a template
 * @author DocuSign
 */

const path = require('path')
    , docusign = require('docusign-esign')
    , validator = require('validator')
    , dsConfig = require('../../ds_configuration.js').config
    ;

const eg009UseTemplate = exports
    , eg = 'eg009' // This example reference.
    , mustAuthenticate = '/ds/mustAuthenticate'
    , minimumBufferMin = 3
    ;


/**
 * Send envelope with a template
 * @param {object} req Request obj 
 * @param {object} res Response obj
 */
eg009UseTemplate.createController = async (req, res) => {
    // Step 1. Check the token
    // At this point we should have a good token. But we
    // double-check here to enable a better UX to the user.
    let tokenOK = req.dsAuthCodeGrant.checkToken(minimumBufferMin);
    if (! tokenOK) {
        req.flash('info', 'Sorry, you need to re-authenticate.');
        // We could store the parameters of the requested operation 
        // so it could be restarted automatically.
        // But since it should be rare to have a token issue here,
        // we'll make the user re-enter the form data after 
        // authentication.
        req.dsAuthCodeGrant.setEg(req, eg);
        res.redirect(mustAuthenticate);
    }

    if (!req.session.templateId) {
        res.render('pages/examples/eg009UseTemplate', {
            eg: eg, csrfToken: req.csrfToken(), 
            title: "Send envelope using a template",
            templateOk: req.session.templateId,
            sourceFile: path.basename(__filename),
            sourceUrl: dsConfig.githubExampleUrl + path.basename(__filename),
            documentation: dsConfig.documentation + eg,
            showDoc: dsConfig.documentation
        });
    }

    // Step 2. Call the worker method
    let body = req.body
        // Additional data validation might also be appropriate
      , envelopeArgs = {
            templateId: req.session.templateId,
            }
      , args = {
            accessToken: req.user.accessToken,
            basePath: req.session.basePath,
            accountId: req.session.accountId,
            envelopeArgs: envelopeArgs
        }
      , results = null
      ;

    try {
        results = await eg009UseTemplate.worker (args)
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
            title: "Templates::get results",
            h1: "Results",
            message: `Results from the Templates::get method:`,
            json: JSON.stringify(results)
        });
    }
}

/**
 * This function does the work of creating the envelope 
 * @param {object} args object 
 */
// ***DS.snippet.0.start
eg009UseTemplate.worker = async (args) => {
    // Data for this method
    // args.basePath
    // args.accessToken
    // args.accountId


    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    
    // THIS IS A TEST OF ISSUE 82
    // SEE https://github.com/docusign/docusign-node-client/issues/82    
    let templatesApi = new docusign.TemplatesApi(dsApiClient);
    let results = await templatesApi.get(args.accountId, args.envelopeArgs.templateId);
    return results;
}
// ***DS.snippet.0.end

/**
 * Form page for this application
 */
eg009UseTemplate.getController = (req, res) => {
    // Check that the authentication token is ok with a long buffer time.
    // If needed, now is the best time to ask the user to authenticate
    // since they have not yet entered any information into the form.
    let tokenOK = req.dsAuthCodeGrant.checkToken();
    if (tokenOK) {
        res.render('pages/examples/eg009UseTemplate', {
            eg: eg, csrfToken: req.csrfToken(),
            title: "Send envelope using a template",
            templateOk: req.session.templateId,
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