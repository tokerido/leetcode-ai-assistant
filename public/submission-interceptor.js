// Injected into LeetCode page context to intercept submission polling
(function () {
  var DEBUG_INTERCEPTOR = false;
  var _originalFetch = window.fetch.bind(window);
  var pendingSubmissionId = null;

  window.fetch = async function () {
    var url = typeof arguments[0] === "string" ? arguments[0] : (arguments[0] && arguments[0].url) || "";
    var response = await _originalFetch.apply(this, arguments);

    // Step 1: capture submission_id when user clicks Submit
    if (/\/problems\/[^/]+\/submit\//.test(url)) {
      try {
        response.clone().json().then(function (data) {
          if (data && data.submission_id) {
            if (DEBUG_INTERCEPTOR) console.log("[Interceptor] Submit posted, id:", data.submission_id);
            pendingSubmissionId = data.submission_id;
          }
        }).catch(function () {});
      } catch (e) {}
    }

    // Step 2: only fire when the check for that specific submission_id returns Accepted
    if (
      pendingSubmissionId &&
      url.includes("/submissions/detail/" + pendingSubmissionId + "/check/")
    ) {
      try {
        response.clone().json().then(function (data) {
          if (data && data.status_msg === "Accepted") {
            if (DEBUG_INTERCEPTOR) console.log("[Interceptor] Accepted:", data);
            pendingSubmissionId = null;
            window.postMessage(
              { source: "leetcode-ai-interceptor", type: "SUBMISSION_ACCEPTED" },
              "*"
            );
          } else if (data && data.state === "SUCCESS") {
            // Submission finished but not accepted — clear pending
            pendingSubmissionId = null;
          }
        }).catch(function () {});
      } catch (e) {}
    }

    return response;
  };
})();
