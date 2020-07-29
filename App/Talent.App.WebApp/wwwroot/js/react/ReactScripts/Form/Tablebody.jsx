import React from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Icon, Dropdown, Form, Grid } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';




export class TableRowExperience extends React.Component {

    constructor(props) {
        super(props);
        const experience = this.props.displayRowItem;
        experience.start = moment(experience.start)
        experience.end = moment(experience.end)
        this.state = {
            rowEdit: false,
            experienceIndex: this.props.experienceIndex,
            displayRowItem: experience
        }
        this.openEdit = this.openEdit.bind(this);
        this.closeEdit = this.closeEdit.bind(this);
        this.renderDisplay = this.renderDisplay.bind(this);
        this.renderEdit = this.renderEdit.bind(this);
        this.handleChange = this.handleChange.bind(this)
        this.updateExperience = this.updateExperience.bind(this)
        this.handleStartDateChange = this.handleStartDateChange.bind(this)
        this.handleEndDateChange = this.handleEndDateChange.bind(this)
    };

    openEdit() {
        this.setState(
            { rowEdit: true }
            )
    }

    closeEdit() {
        this.setState(
            { rowEdit: false }
            )
    }

    updateExperience() {
        this.props.updateTableRow(this.state.displayRowItem, this.state.experienceIndex);
        this.closeEdit();
    }

    handleChange(event) {
        
        const data = Object.assign({}, this.state.displayRowItem)
        data[event.target.name] = event.target.value
        this.setState({
            displayRowItem: data
        })
    }

    handleStartDateChange(event) {
        const data = Object.assign({}, this.state.displayRowItem)
        data.start = event
        this.setState({ displayRowItem: data })
    }

    handleEndDateChange(event) {
        const data = Object.assign({}, this.state.displayRowItem)
        data.end = event
        this.setState({ displayRowItem: data })
    }

    renderDisplay() {
        const item = this.state.displayRowItem
        return (
            < Table.Row >
                <Table.Cell>{item.company}</Table.Cell>
                <Table.Cell>{item.position}</Table.Cell>
                <Table.Cell>{item.responsibilities}</Table.Cell>
                <Table.Cell>{item.start.format('DD/MM/YYYY')}</Table.Cell>
                <Table.Cell>{item.end.format('DD/MM/YYYY')}</Table.Cell>
                <Table.Cell textAlign='right'>
                    <Icon name='pencil' onClick={this.openEdit} />
                    <Icon name='delete' onClick={this.props.deleteExperience} />
                </Table.Cell>
            </Table.Row >
        )
    }

    renderEdit() {
        const item = this.state.displayRowItem
        return (
            < Table.Row >
                <Table.Cell colSpan={6}>
                    <Grid divided='vertically'>
                        <Grid.Row columns={2}>
                            <Grid.Column>
                                <label>Company:</label>
                                <input type='text'
                                    onChange={this.handleChange}
                                    name='company'
                                    value={item.company} />
                            </Grid.Column>
                            <Grid.Column>
                                <label>Position:</label>
                                <input type='text'
                                    onChange={this.handleChange}
                                    name='position'
                                    value={item.position} />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row columns={2}>
                            <Grid.Column>
                                <Form.Field>
                                    <label>Start Date:</label>
                                    <DatePicker
                                        selected={item.start}
                                        onChange={this.handleStartDateChange}
                                    />
                                </Form.Field>
                            </Grid.Column>
                            <Grid.Column>
                                <Form.Field>
                                    <label>End Date:</label>
                                    <DatePicker
                                        selected={item.end}
                                        onChange={this.handleEndDateChange}
                                    />
                                </Form.Field>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <label>Responsibilities:</label>
                                <input type='text'
                                    onChange={this.handleChange}
                                    name='responsibilities'
                                    value={item.responsibilities} />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <Button basic color='blue' content='Update' onClick={this.updateExperience} />
                                <Button basic color='red' content='Cancle' onClick={this.closeEdit} />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Table.Cell>
            </Table.Row >
        )
    }

    render() {

        return (
            this.state.rowEdit ? this.renderEdit() : this.renderDisplay()
        )

    }
}