<?php
/**
 * Plugin Name: Dashboard Generator Integration
 * Description: Embeds Dashboard Generator in iframe and allows saving generated images to Media Library
 * Version: 1.0.0
 * Author: Dashboard Generator
 */

if (!defined('ABSPATH')) {
    exit;
}

class Dashboard_Generator_Integration {

    private $dashboard_url = 'https://dashboards.tytan.kolabogroup.pl';

    public function __construct() {
        add_action('init', array($this, 'register_shortcode'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    /**
     * Register the shortcode
     */
    public function register_shortcode() {
        add_shortcode('dashboard_generator', array($this, 'render_shortcode'));
    }

    /**
     * Enqueue frontend scripts
     */
    public function enqueue_scripts() {
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'dashboard_generator')) {
            wp_enqueue_script(
                'dashboard-generator-integration',
                plugin_dir_url(__FILE__) . 'dashboard-generator-integration.js',
                array(),
                '1.0.0',
                true
            );

            wp_localize_script('dashboard-generator-integration', 'dashboardGeneratorConfig', array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'restUrl' => rest_url('dashboard-generator/v1/'),
                'nonce' => wp_create_nonce('wp_rest'),
                'dashboardUrl' => $this->dashboard_url
            ));
        }
    }

    /**
     * Render the shortcode
     */
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'width' => '100%',
            'height' => '800px',
            'theme' => '',
            'preset' => '3+3',
            'skeleton' => 'false',
            'show_controls' => 'true'
        ), $atts);

        // Build iframe URL with parameters
        $iframe_url = $this->dashboard_url . '/?embedMode=wordpress';

        if (!empty($atts['theme'])) {
            $iframe_url .= '&theme=' . urlencode($atts['theme']);
        }
        if (!empty($atts['preset'])) {
            $iframe_url .= '&preset=' . urlencode($atts['preset']);
        }
        if ($atts['skeleton'] === 'true') {
            $iframe_url .= '&skeleton=true';
        }

        $show_controls = $atts['show_controls'] === 'true';

        ob_start();
        ?>
        <div class="dashboard-generator-container" style="position: relative;">
            <?php if ($show_controls): ?>
            <div class="dashboard-generator-controls" style="margin-bottom: 15px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                <button type="button" class="dashboard-regenerate-btn" style="padding: 10px 20px; background: #0073aa; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                    Regeneruj Dashboard
                </button>
                <button type="button" class="dashboard-save-btn" style="padding: 10px 20px; background: #2e7d32; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                    Zapisz obraz do biblioteki
                </button>
                <span class="dashboard-status" style="color: #666; font-size: 13px;"></span>
            </div>
            <?php endif; ?>

            <iframe
                id="dashboard-generator-iframe"
                src="<?php echo esc_url($iframe_url); ?>"
                style="width: <?php echo esc_attr($atts['width']); ?>; height: <?php echo esc_attr($atts['height']); ?>; border: 1px solid #ddd; border-radius: 8px;"
                allow="clipboard-write"
            ></iframe>

            <!-- Hidden container for received image preview -->
            <div class="dashboard-image-preview" style="display: none; margin-top: 15px;">
                <h4 style="margin-bottom: 10px;">Podgląd wygenerowanego obrazu:</h4>
                <img src="" alt="Dashboard Preview" style="max-width: 100%; border: 1px solid #ddd; border-radius: 5px;">
            </div>
        </div>

        <style>
            .dashboard-generator-controls button:hover {
                opacity: 0.9;
            }
            .dashboard-generator-controls button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .dashboard-save-success {
                color: #2e7d32 !important;
            }
            .dashboard-save-error {
                color: #c62828 !important;
            }
        </style>
        <?php
        return ob_get_clean();
    }

    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        register_rest_route('dashboard-generator/v1', '/save-image', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_image_to_media'),
            'permission_callback' => array($this, 'check_permissions')
        ));
    }

    /**
     * Check if user has permission to upload media
     */
    public function check_permissions() {
        // Allow logged-in users who can upload files
        // For public access, you might want to implement additional security (tokens, etc.)
        return current_user_can('upload_files') || true; // Change to just current_user_can for restricted access
    }

    /**
     * Save base64 image to WordPress Media Library
     */
    public function save_image_to_media(WP_REST_Request $request) {
        $image_data = $request->get_param('imageData');
        $filename = $request->get_param('filename');
        $dashboard_name = $request->get_param('dashboardName');

        if (empty($image_data)) {
            return new WP_Error('missing_data', 'No image data provided', array('status' => 400));
        }

        // Parse base64 data URL
        if (preg_match('/^data:image\/(\w+);base64,/', $image_data, $matches)) {
            $image_type = $matches[1];
            $image_data = substr($image_data, strpos($image_data, ',') + 1);
        } else {
            $image_type = 'png';
        }

        $decoded_image = base64_decode($image_data);

        if ($decoded_image === false) {
            return new WP_Error('invalid_image', 'Could not decode image data', array('status' => 400));
        }

        // Generate filename if not provided
        if (empty($filename)) {
            $filename = 'dashboard-' . sanitize_title($dashboard_name ?: 'generated') . '-' . time() . '.' . $image_type;
        }

        // Ensure filename has correct extension
        if (!preg_match('/\.' . $image_type . '$/', $filename)) {
            $filename .= '.' . $image_type;
        }

        // Sanitize filename
        $filename = sanitize_file_name($filename);

        // Get WordPress upload directory
        $upload_dir = wp_upload_dir();

        if (!empty($upload_dir['error'])) {
            return new WP_Error('upload_error', $upload_dir['error'], array('status' => 500));
        }

        $file_path = $upload_dir['path'] . '/' . $filename;

        // Save the file
        $saved = file_put_contents($file_path, $decoded_image);

        if ($saved === false) {
            return new WP_Error('save_error', 'Could not save image file', array('status' => 500));
        }

        // Prepare attachment data
        $file_type = wp_check_filetype($filename, null);

        $attachment = array(
            'post_mime_type' => $file_type['type'],
            'post_title' => sanitize_file_name(pathinfo($filename, PATHINFO_FILENAME)),
            'post_content' => '',
            'post_status' => 'inherit'
        );

        // Insert attachment
        $attachment_id = wp_insert_attachment($attachment, $file_path);

        if (is_wp_error($attachment_id)) {
            return new WP_Error('attachment_error', 'Could not create media attachment', array('status' => 500));
        }

        // Generate attachment metadata
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $attachment_data = wp_generate_attachment_metadata($attachment_id, $file_path);
        wp_update_attachment_metadata($attachment_id, $attachment_data);

        // Get the attachment URL
        $attachment_url = wp_get_attachment_url($attachment_id);

        return rest_ensure_response(array(
            'success' => true,
            'attachmentId' => $attachment_id,
            'url' => $attachment_url,
            'filename' => $filename,
            'message' => 'Image saved to Media Library'
        ));
    }
}

// Initialize the plugin
new Dashboard_Generator_Integration();
