import React, { Component } from 'react';
import Cookies from 'js-cookie';
import { Button } from 'semantic-ui-react'

export default class PhotoUpload extends Component {
    constructor(props) {
        super(props);
        //const imageId = props.imageId ? props.imageId : "https://react.semantic-ui.com/images/wireframe/square-image.png"
        this.state = {
            uploadButton: "none",
            newFileUrl: null,
            newFile: null
        }
        this.fileSelectedChange = this.fileSelectedChange.bind(this);
        this.fileUpload = this.fileUpload.bind(this);
        this.uploadAndSave = this.uploadAndSave.bind(this);
    };

    uploadAndSave() {
        debugger;
        let file = this.state.newFile;
        const form = new FormData();
        form.append('file', file);
        let profilePhotoUrl = "/images/" + file.name;
        console.log(profilePhotoUrl);
        this.props.updateProfileData({
            profilePhotoUrl
        });
        this.fileUpload(form);
    }

    fileUpload(form) {
        var url = this.props.savePhotoUrl;
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: url,
            headers: {
                'Authorization': 'Bearer ' + cookies
            },
            type: "POST",
            data: form,
            processData: false,
            contentType: false,
            success: function (res) {
                debugger;
                console.log(res)
                if (res.success == true) {
                    TalentUtil.notification.show("Profile updated sucessfully", "success", null, null)
                } else {
                   
                    TalentUtil.notification.show("Profile did not update successfully", "error", null, null)
                }

            }.bind(this),
            error: function (res, a, b) {
                console.log(res)
                console.log(a)
                console.log(b)
            }
        })
    }

    fileSelectedChange() {
        debugger;
        let acceptedExt = ["image/png", "image/jpg", "image/jpeg", "image/gif"];
        
        let selectedFile = event.target.files[0];
        console.log(event.target.files[0]);
        if (this.state.newFile) {
            URL.revokeObjectURL(this.state.newFileUrl);
        }
        if (acceptedExt.includes(selectedFile.type)) {
            this.setState({
                uploadButton: "",
                newFileUrl: URL.createObjectURL(event.target.files[0]),
                newFile: event.target.files[0]
            })
        }
    }
    

    render() {
        let server = this.props.savePhotoUrl;
        let n = server.search("/profile");
        let url = server.slice(0, n);
        let imageId = this.props.imageId ? url + this.props.imageId : "https://react.semantic-ui.com/images/wireframe/square-image.png";
        if (this.state.newFileUrl) {
            imageId = this.state.newFileUrl;
        }
        debugger;
        return (
            <div className="ui two column grid">
                <div className="column">
                    <h1>Profile Photo</h1>
                </div>
                <div className="column">
                    <Button htmlFor="file" as="label" className="ui small circular image" ><img src={imageId}
                        />
                    </Button>
                    <br></br>
                    <button type="submit" style={{ display: this.state.uploadButton, }} onClick={this.uploadAndSave} className="ui teal button"><i className="upload icon"></i>Upload</button>
                        <input type="file" id="file" style={{ display: "none" }} onChange={this.fileSelectedChange} />  
                </div>
                
            </div>
        )
    }
}