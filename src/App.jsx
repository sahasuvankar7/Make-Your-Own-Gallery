import React from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
function App() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [email, setEmail] = useState("");
  const [images, setImages] = useState([]); // for storing images in array

  // console.log(email);

  // https://nhxubqrgywpfzqenexsn.supabase.co/storage/v1/object/public/Images/98d510af-7a3a-4d66-ab80-9a016192e279/92d6a2cd-b9b8-4d27-8e9e-f3d139fee1fd


  const CDNURL =
    "https://nhxubqrgywpfzqenexsn.supabase.co/storage/v1/object/public/Images/";

  const submitButtonLogIn = async () => {
    const { data, error } = supabase.auth.signInWithOtp({
      email: email,
    }); // sign in with one time password
    if (error) {
      console.log("some error happend with you authetication", error);
    } else {
      alert(`Now Check out Your email id :${email} There Click login`);
    }
  };

  const signOut = async () => {
    const { error } = supabase.auth.signOut();
  };

  // get image from supabase store and store it into images array which we created above as state variable
  const getImages = async () => {
    const { data, error } = await supabase.storage
      .from("Images")
      .list(user?.id + "/", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });
    // data : [image1, image2 , image3];
    // here data from the bucket as considerd as array
    if (data != null) {
      setImages(data);
    } else {
      alert("loading images ");
      console.log("some error happened");
    }
  };

  // here if any changes happend user dependency or array means userLoggedIn , userLoggedout, loading website as well as if user change from one to another then useEffect function will be called.
  useEffect(() => {
    if (user) {
      // if the user exists then we can call getImages() method
      getImages();
    }
  }, [user]);

  // uploading image to supabase or image gallery :
  const uploadImage = async (e) => {
    let file = e.target.files[0]; // it gets only the selected first image
    /*if user is Suvankar the all images are uploaded under my user folder like that:
    Suvankar/cr7.png
    It is not like that i am uploading images under another user's name;
    */
    const { data, error } = await supabase.storage
      .from("Images")
      .upload(user.id + "/" + uuidv4(), file);
    /*   whenever we pick a picture from gallery that pic must be uploaded for the first time . If user by any chance or repeatedly upload the same image then it's not allowed. so , each image must have unique id as uuid which we have to import from uuid.*/

    if (data) {
      getImages();
    } else {
      console.log(error);
    }
  };

  // delete image from image gallery
  const deleteImage = async (imageName) => {
    const { error } = await supabase.storage
      .from("Images")
      .remove([user.id + "/" + imageName]);

    // if any error occurred then show it to alert msg . otherwise call getImages() method for new image list from bucket after deleting the image.
    if (error) {
      alert(error);
    } else {
      getImages();
    }
  };
  return (
    <div className="container mx-auto mt-4">
      {/* if the user exists : show them the image gallery */}
      {/* if not : then show them log in page  */}
      {user === null ? (
        <>
          <h1 className="text-4xl text-center">Welcome to Image Gallery</h1>

          <div className="flex flex-col justify-center items-center">
            <div>
              <p className="mt-4">Enter a email to supabase magic link</p>
            </div>
            <div>
              <input
                type="text"
                placeholder="Enter you email"
                className="mt-4 mb-4 py-1 w-[450px] border-2 text-center border-black rounded-md"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              onClick={() => submitButtonLogIn()}
              className="bg-blue-700 py-2 px-4 rounded-lg font-medium text-white"
            >
              Submit
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <h1>Your Image Gallery</h1>
          <button
            className="bg-purple-700 text-white rounded-md py-2 px-3 font-semibold hover:bg-purple-800"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
          <p>Current User :{user.email}</p>
          <form className="flex flex-col  items-center">
            <label htmlFor="imageInput"> Select an image ( JPG or PNG )</label>
            {/* <input
              type="file"
              id="imageInput"
              name="image"
              accept="image/jpeg , image/png"
              onChange={(e) => uploadImage(e)}
            /> */}

            <label
              class="block mb-2 text-sm font-medium text-gray-900"
              for="file_input"
            >
              Upload file
            </label>
            <input
              class="block w-1/4 text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 text-center"
              id="file_input"
              type="file"
              name="image"
              accept="image/jpeg , image/png"
              onChange={(e) => uploadImage(e)}
            />

            {/* the above onChange through this line the event(e) we are only getting the reference of the that file */}
          </form>
          <hr />
          <h1>Your Image</h1>
          <div className="grid grid-cols-4 gap-2 ml-4 mr-4">
            {/* here the image link can considered as a : CDNURL + user.id + '/' + image.name */}
            {images.map((image) => {
              return (
                <div
                  className="flex flex-col justify-center items-center border-neutral-300 border-2 p-3 rounded-md"
                  key={CDNURL + user.id + "/" + image.name}
                >
                  <img
                    className="h-60 w-full rounded-md"
                    src={CDNURL + user.id + "/" + image.name}
                    alt="_blank"
                  />
                  <button
                    onClick={() => deleteImage(image.name)}
                    className="bg-gray-800 text-white rounded-full py-2 px-3 font-semibold hover:bg-white hover:text-black mt-4 w-2/4 text-center border-gray-950 border-2 "
                  >
                    Delete Image
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
