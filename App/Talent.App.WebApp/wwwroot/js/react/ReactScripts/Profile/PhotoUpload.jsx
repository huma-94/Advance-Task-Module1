import React, { Component } from 'react';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import { Grid, Icon, Button, Image } from 'semantic-ui-react';

export default class PhotoUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            profilePhotoUrl: this.props.profilePhotoUrl 
        }
        this.handleImageChange = this.handleImageChange.bind(this);
        this.handleUploadImage = this.handleUploadImage.bind(this);
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.profilePhotoUrl !== this.props.profilePhotoUrl)
        {
            this.setState({
                profilePhotoUrl: nextProps.profilePhotoUrl
            });
        }
    };

    handleImageChange(e) {
        e.preventDefault();
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onloadend = () =>
        {
            this.setState({
                file: file,
                profilePhotoUrl: reader.result
            });
        }
        reader.readAsDataURL(file)
    };

    handleUploadImage() {
        let data = new FormData();
        data.append('file', this.state.file);
        

        $.ajax({
            url: 'http://localhost:60290/profile/profile/updateProfilePhoto',
            headers: {
                
                'Authorization': 'Bearer ' + Cookies.get('talentAuthToken')
            },
            type: "POST",
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            success: function (res) {
              
                if (res.success) {
                     this.setState(Object.assign({}, this.state, { file: null }));
                    this.props.updateProfileData(res.data);
                    TalentUtil.notification.show("Update photo successfully", "success", null, null);
                } else {
                    TalentUtil.notification.show(res.message, "error", null, null);
                  
                }
            }.bind(this),
            error: function (res, status, error) {
                TalentUtil.notification.show("There is an error when updating Image - " + error, "error", null, null);
            }
        });
       
    }
    

    render() {
        
        let button = null;
        if (this.state.file) {
            button = <div>
                <br/>
                <Button
                    type='reset'
                    compact
                    color='teal'
                    onClick={this.handleUploadImage}
                >
                    <Icon name='upload' />
                    Upload
                </Button>
            </div>
        }

        let imageView;
        if (this.state.profilePhotoUrl) {
            
            imageView = <Image
                src={this.state.profilePhotoUrl}
                size='medium'
                circular
                style={{ width: '112px', height: '112px' }}
                onClick={() => this.upload.click()}
            />
        } else {
            
            imageView = <Icon
                circular
                type='file'
                size='huge'
                name='camera retro'
                style={{ width: '112px', height: '112px' }}
                onClick={() => this.upload.click()}
            />
        }

        return (
            <Grid.Column textAlign='center'>
                <input
                    type="file"
                    ref={(ref) => this.upload = ref}
                    style={{ display: 'none' }}
                    onChange={this.handleImageChange}
                />
                {imageView}
                {button}
            </Grid.Column>
        )
    }
}

PhotoUpload.propTypes = {
    savePhotoUrl: PropTypes.string.isRequired,
    updateProfileData: PropTypes.func.isRequired,
};
