<?php

// Класс создает custom type для статусов клиентов

class ClientStatusCustomType
{
	
	/**
	* Custom post type name (название custom type)
	*/
	const POST_TYPE = 'flymoney_status';


    function __construct() {
    	// init on new object creation
		$this->register_custom_post_type();
		$this->register_meta_fields();
    }
    
    /**
	 * Register custom post type
	 * 
	 * @return	post_type
	 * @access	private
	 * 
	 */
	private function register_custom_post_type() {
		return register_post_type( $this->get_type_name(), $this->get_post_type_args() );
	}
	
	/**
	 * Get args array for registered post type
	 * 
	 * @return	array
	 * @access	private
	 */
	private function get_post_type_args() {
		return array(
			'labels' => array(
				'name' 				 => 'Статусы клиентов',
				'singular_name' 	 => 'Статус клиента',
				'add_new'            => 'Добавить статус',
				'add_new_item'       => 'Добавить новый статус',
				'edit_item'          => 'Редактировать статус',
				'new_item'           => 'Новый статус',
				'view_item'          => 'Просмотр статуса',
				),
			'description' => 'Статусы клиентов',
			'hierarchical' => false,
			'public' => false,
			'show_ui' => true,
			'show_in_rest' => true,
			'supports' => array('title'),
			'exclude_from_search' => true
		);
	}

	/**
	 * Register meta fields for custom post type
	 * 
	 * @access	private
	 */
	private function register_meta_fields() {
		register_rest_field( 
			self::POST_TYPE, 
			'meta', 
			array(
				'get_callback' => function ( $data ) {
					return get_post_meta( $data['id'], '', '' );
				},
				'schema' => array(
					'description' => __( 'Flymoney clent ctatus meta', 'flymoney_exchange' ), 
					'type' => 'string'
				)
			)
		);
	}
	
	/**
	 * Return POST_TYPE
	 * 
	 * @return  string
	 * @access	private
	 */
	private function get_type_name() {
		return self::POST_TYPE;
	}
	
}
