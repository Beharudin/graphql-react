import React, { useState, useEffect, Fragment } from "react";

import Post from "../../components/Feed/Post/Post";
import Button from "../../components/Button/Button";
import FeedEdit from "../../components/Feed/FeedEdit/FeedEdit";
import Input from "../../components/Form/Input/Input";
import Paginator from "../../components/Paginator/Paginator";
import Loader from "../../components/Loader/Loader";
import ErrorHandler from "../../components/ErrorHandler/ErrorHandler";
import "./Feed.css";

function Feed({ token, userId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [editPost, setEditPost] = useState(null);
  const [status, setStatus] = useState("");
  const [postPage, setPostPage] = useState(1);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPosts = (direction) => {
    if (direction) {
      setPostsLoading(true);
      setPosts([]);
    }
    let page = postPage;
    if (direction === "next") {
      page++;
      setPostPage(page);
    }
    if (direction === "previous") {
      page--;
      setPostPage(page);
    }

    const graphqlQuery = {
      query: `
        {
          posts(page: ${page}) {
            posts {
              _id
              title
              content
              imageUrl
              creator {
                name
              }
              createdAt
            }
            totalPosts
          }
        }
      `,
      // variables: {
      //   page: page,
      // },
    };

    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error('Fetching posts failed!');
        }
        setPosts(
          resData.data.posts.posts.map((post) => {
            return {
              ...post,
              imagePath: post.imageUrl,
            };
          }),
        );
        setTotalPosts(resData.data.posts.totalPosts);
        setPostsLoading(false);
      })
      .catch(catchError);
  };

  const statusUpdateHandler = (event) => {
    event.preventDefault();
    fetch("http://localhost:8080/auth/status", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: status,
      }),
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
      })
      .catch(catchError);
  };

  const newPostHandler = () => {
    setIsEditing(true);
  };

  const startEditPostHandler = (postId) => {
    const loadedPost = posts.find((p) => p._id === postId);
    setIsEditing(true);
    setEditPost(loadedPost);
  };

  const cancelEditHandler = () => {
    setIsEditing(false);
    setEditPost(null);
  };

  const finishEditHandler = (postData) => {
    setEditLoading(true);
    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("content", postData.content);
    formData.append("image", postData.image);

    let graphqlQuery = {
      query: `
          mutation {
            createPost(postInput: {title: "${postData.title}", content: "${postData.content}", imageUrl: "${postData.image}" }) {
              _id
              title
              content
              imageUrl
              creator {
                name
              }
              createdAt
            }
          }
        `,
      // ,
      //   variables: {
      //     title: postData.title,
      //     content: postData.content,
      //     imageUrl: imageUrl
      //   }
    };

    fetch("http://localhost:8080/graphql", {
      method: "POST",
      body: JSON.stringify(graphqlQuery),
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors && resData.errors[0].status === 422) {
          throw new Error(
            "Validation failed. Make sure the email address isn't used yet!",
          );
        }
        if (resData.errors) {
          throw new Error("User login failed!");
        }
        const resDataField = editPost ? "updatePost" : "createPost";
        const responsePost = resData.data[resDataField];
        const post = {
          _id: responsePost._id,
          title: responsePost.title,
          content: responsePost.content,
          creator: responsePost.creator,
          createdAt: responsePost.createdAt,
          imagePath: responsePost.imageUrl,
        };

        setPosts((prevPosts) => {
          const updatedPosts = [...prevPosts];
          if (editPost) {
            const postIndex = prevPosts.findIndex(
              (p) => p._id === editPost._id,
            );
            if (postIndex !== -1) {
              updatedPosts[postIndex] = post;
            }
          } else {
            if (prevPosts.length >= 2) {
              updatedPosts.pop();
            }
            updatedPosts.unshift(post);
          }
          return updatedPosts;
        });

        if (!editPost) {
          setTotalPosts((prevTotal) => prevTotal + 1);
        }

        setIsEditing(false);
        setEditPost(null);
        setEditLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsEditing(false);
        setEditPost(null);
        setEditLoading(false);
        setError(err);
      });
  };

  const statusInputChangeHandler = (input, value) => {
    setStatus(value);
  };

  const deletePostHandler = (postId) => {
    setPostsLoading(true);
    fetch("http://localhost:8080/feed/post/" + postId, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Deleting a post failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        loadPosts();
      })
      .catch((err) => {
        console.log(err);
        setPostsLoading(false);
      });
  };

  const errorHandler = () => {
    setError(null);
  };

  const catchError = (error) => {
    setError(error);
  };

  useEffect(() => {
    fetch("http://localhost:8080/auth/status", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error("Failed to fetch user status.");
        }
        return res.json();
      })
      .then((resData) => {
        setStatus(resData.status);
      })
      .catch(catchError);

    loadPosts();
  }, [token]);

  return (
    <Fragment>
      <ErrorHandler error={error} onHandle={errorHandler} />
      <FeedEdit
        editing={isEditing}
        selectedPost={editPost}
        loading={editLoading}
        onCancelEdit={cancelEditHandler}
        onFinishEdit={finishEditHandler}
      />
      <section className="feed__status">
        <form onSubmit={statusUpdateHandler}>
          <Input
            type="text"
            placeholder="Your status"
            control="input"
            onChange={statusInputChangeHandler}
            value={status}
          />
          <Button mode="flat" type="submit">
            Update
          </Button>
        </form>
      </section>
      <section className="feed__control">
        <Button mode="raised" design="accent" onClick={newPostHandler}>
          New Post
        </Button>
      </section>
      <section className="feed">
        {postsLoading && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Loader />
          </div>
        )}
        {posts.length <= 0 && !postsLoading ? (
          <p style={{ textAlign: "center" }}>No posts found.</p>
        ) : null}
        {!postsLoading && (
          <Paginator
            onPrevious={() => loadPosts("previous")}
            onNext={() => loadPosts("next")}
            lastPage={Math.ceil(totalPosts / 2)}
            currentPage={postPage}
          >
            {posts.map((post) => (
              <Post
                key={post._id}
                id={post._id}
                author={post.creator.name}
                date={new Date(post.createdAt).toLocaleDateString("en-US")}
                title={post.title}
                image={post.imageUrl}
                content={post.content}
                onStartEdit={() => startEditPostHandler(post._id)}
                onDelete={() => deletePostHandler(post._id)}
              />
            ))}
          </Paginator>
        )}
      </section>
    </Fragment>
  );
}

export default Feed;
