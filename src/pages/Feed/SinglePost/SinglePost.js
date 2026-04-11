import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import Image from "../../../components/Image/Image";
import "./SinglePost.css";

function SinglePost({ token, userId }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");

  const { postId } = useParams();

  useEffect(() => {
    const graphqlQuery = {
      query: `
      {
          post(id: "${postId}") {
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
      // variables: {
      //   postId: postId
      // }
    };
    fetch("http://localhost:8080/graphql", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Fetching post failed!");
        }
        setTitle(resData.data.post.title);
        setAuthor(resData.data.post.creator.name);
        setImage("http://localhost:8080/" + resData.data.post.imageUrl);
        setDate(
          new Date(resData.data.post.createdAt).toLocaleDateString("en-US"),
        );
        setContent(resData.data.post.content);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [postId, token]);

  return (
    <section className="single-post">
      <h1>{title}</h1>
      <h2>
        Created by {author} on {date}
      </h2>
      <div className="single-post__image">
        <Image contain imageUrl={image} />
      </div>
      <p>{content}</p>
    </section>
  );
}

export default SinglePost;
