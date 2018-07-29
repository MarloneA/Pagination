import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import PropTypes from 'prop-types';

import Room from './Room';
import '../assets/styles/roomlist.scss';
import { GET_ROOMS_QUERY, GET_LOCATIONS_QUERY } from '../graphql/queries/Rooms';
import { formatRoomData } from '../graphql/mappers/Rooms';
import ColGroup from './helpers/ColGroup';
import TableHead from './helpers/TableHead';
import AddRoom from './rooms/AddRoom';
import Pagination from './commons/Pagination';
import rooms from '../fixtures/rooms';

class RoomsList extends Component {
  /*
  The list of rooms being displayed in the frontend is dummy data loaded from the fixtures
  Once pagination has been done on the backend, {rooms.roomsList} should be replaced with {allRooms}
  This 'const { loading, error } = props.data;' should also be replaced
  with this 'const { allRooms, loading, error } = props.data;'
  */

  constructor(props) {
    super(props);
    this.state = {
      perPage: 5,
      page: 1,
    };
  }

  getTotalPages = (totalResults, perPage) => (
    Math.ceil((totalResults) / perPage)
  );

  pager = (perPage, page) => {
    this.setState({ perPage, page });
  };

  paginator = () => {
    const newList = Object.assign([], rooms.roomsList);
    return (
      {
        rooms: newList.slice(this.state.perPage * (this.state.page - 1), this.state.perPage * this.state.page),
        size: rooms.roomsList.length,
      }
    );
  }

  render() {
    const { pageInfo } = rooms;
    const { loading, error } = this.props.data;
    const {
      allLocations: locations,
      loading: loadingLocations,
      error: locationsError,
    } = this.props.locations;

    const paginatedRooms = this.paginator();

    if (loading || loadingLocations) return <div>Loading...</div>;

    if (error || locationsError) {
      return <div>{error ? error.message : locationsError.message}</div>;
    }

    return (
      <div className="settings-rooms">
        <AddRoom locations={locations} />
        <div className="settings-rooms-list">
          <table>
            <ColGroup />
            <TableHead titles={['Room', 'Location', 'Office', 'Action']} />
            <tbody>
              {paginatedRooms.rooms.map(room => (
                <Room
                  room={formatRoomData(room)}
                  key={room.id}
                  locations={locations}
                />
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          pageInfo={pageInfo}
          pager={this.pager}
          totalPages={this.getTotalPages(paginatedRooms.size, this.state.perPage)}
        />
      </div>
    );
  }
}

RoomsList.propTypes = {
  data: PropTypes.shape({
    allRooms: PropTypes.array,
    loading: PropTypes.bool,
    error: PropTypes.object,
  }).isRequired,
  locations: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    })),
    PropTypes.object,
  ]).isRequired,
};

export default compose(
  graphql(GET_ROOMS_QUERY, { name: 'data' }),
  graphql(GET_LOCATIONS_QUERY, { name: 'locations' }),
)(RoomsList);
