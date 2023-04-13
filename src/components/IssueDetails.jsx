import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { GoIssueOpened, GoIssueClosed } from "react-icons/go";

import { useUserData } from "../helpers/useUserData";
import { relativeDate } from "../helpers/relativeDate";
import { possibleStatus } from "../helpers/defaultData";

function useIssueData(issueNumber) {
  return useQuery(["issues", issueNumber], () => {
    return fetch(`/api/issues/${issueNumber}`).then(res => res.json());
  });
}

function useIssueComments(issueNumber) {
  return useQuery(["issues", issueNumber, "comments"], () => {
    return fetch(`/api/issues/${issueNumber}/comments`).then(res => res.json());
  });
}

const Comment = ({ comment, createdBy, createdDate }) => {
  const userQuery = useUserData(createdBy);

  if (userQuery.isLoading)
    return (
      <div className="comment">
        <div>
          <div className="comment-header">Loading…</div>
        </div>
      </div>
    );
  return (
    <div className="comment">
      <img src={userQuery.data.profilePictureUrl} alt="Commenter Avatar" />
      <div>
        <div className="comment-header">
          <span>{userQuery.data.name}</span> commented{" "}
          <span>{relativeDate(createdDate)}</span>
        </div>
        <div className="comment-body">{comment}</div>
      </div>
    </div>
  );
};

const IssueHeader = ({
  title,
  number,
  status = "todo",
  createdBy,
  createdDate,
  comments
}) => {
  const statusObject = possibleStatus.find(pstatus => pstatus.id === status);

  const createdUser = useUserData(createdBy);

  return (
    <header>
      <h2>
        {title} <span>#{number}</span>
      </h2>
      <div>
        <span
          className={
            status == "done" || status == "cancelled" ? "closed" : "open"
          }
        >
          {" "}
          {status === "done" || status === "cancelled" ? (
            <GoIssueClosed />
          ) : (
            <GoIssueOpened />
          )}
          {statusObject.label}
        </span>
        <span className="created-by">
          {createdUser.isLoading ? "…" : createdUser.data?.name}
        </span>{" "}
        opened this issue {relativeDate(createdDate)} · {comments.length}{" "}
        comments
      </div>
    </header>
  );
};

export default function IssueDetails() {
  const { number } = useParams();

  const issueQuery = useIssueData(number);
  const commentsQuery = useIssueComments(number);

  return (
    <div className="issue-details">
      {issueQuery.isLoading ? (
        <p>Loading issue…</p>
      ) : (
        <>
          <IssueHeader {...issueQuery.data} />

          <main>
            <section>
              {commentsQuery.isLoading ? (
                <p>Loading…</p>
              ) : (
                commentsQuery.data?.map(comment => (
                  <Comment key={comment.id} {...comment} />
                ))
              )}
            </section>
            <aside />
          </main>
        </>
      )}
    </div>
  );
}
